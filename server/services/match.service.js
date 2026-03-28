const Match = require('../models/Match');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

class MatchService {
  /**
   * Generates matches for all eligible, unmatched users.
   */
  async generateMatches() {
    console.log('Starting match generation process...');
    
    // 1. Get all active matches (pending or matched)
    const activeMatches = await Match.find({ status: { $in: ['pending', 'matched'] } });
    
    // Users currently in an active match
    const matchedUserIds = new Set();
    activeMatches.forEach(m => {
      matchedUserIds.add(m.user1.toString());
      matchedUserIds.add(m.user2.toString());
    });

    // 2. Get all completed profiles not in active matches
    const eligibleProfiles = await Profile.find({
      isComplete: true,
      inWaitingPool: true,
      userId: { $nin: Array.from(matchedUserIds) }
    });

    console.log(`Found ${eligibleProfiles.length} eligible unmatched profiles.`);

    // Keep track of who we match in this run
    const freshlyMatched = new Set();

    for (let i = 0; i < eligibleProfiles.length; i++) {
      const user1 = eligibleProfiles[i];
      if (freshlyMatched.has(user1.userId.toString())) continue;

      let bestCandidate = null;
      let highestScore = -1;
      let bestOverlap = null;

      for (let j = i + 1; j < eligibleProfiles.length; j++) {
        const user2 = eligibleProfiles[j];
        if (freshlyMatched.has(user2.userId.toString())) continue;

        // Skip if they already had a match historically (even declined)
        const pastMatch = await Match.findOne({
          $or: [
            { user1: user1.userId, user2: user2.userId },
            { user1: user2.userId, user2: user1.userId }
          ]
        });
        if (pastMatch) continue;

        // Check mutual filters
        if (!this.passesFilters(user1, user2)) continue;

        // Calculate overlap and score
        const { score, overlapDetails } = this.calculateCompatibility(user1, user2);

        if (score > highestScore) {
          highestScore = score;
          bestCandidate = user2;
          bestOverlap = overlapDetails;
        }
      }

      // If we found a candidate, create a Match
      if (bestCandidate) {
        console.log(`Matching ${user1.userId} with ${bestCandidate.userId} (Score: ${highestScore})`);
        
        await Match.create({
          user1: user1.userId,
          user2: bestCandidate.userId,
          compatibilityScore: highestScore,
          overlapDetails: bestOverlap,
          status: 'pending'
        });

        await Profile.updateMany(
          { userId: { $in: [user1.userId, bestCandidate.userId] } },
          { $set: { inWaitingPool: false } }
        );

        freshlyMatched.add(user1.userId.toString());
        freshlyMatched.add(bestCandidate.userId.toString());
      }
    }
    
    console.log('Match generation complete.');
  }

  passesFilters(p1, p2) {
    // City exact match
    if (p1.basicInfo?.city?.toLowerCase() !== p2.basicInfo?.city?.toLowerCase()) return false;

    // Gender preference
    const p1Wants = p1.preferences?.genderPreference?.toLowerCase();
    const p2Wants = p2.preferences?.genderPreference?.toLowerCase();
    
    const p1Gender = p1.basicInfo?.gender?.toLowerCase();
    const p2Gender = p2.basicInfo?.gender?.toLowerCase();

    // 'anyone' or 'both' could be handled if needed, assuming strict gender match for MVP or just 'male'/'female'
    if (p1Wants && p1Wants !== 'everyone' && p1Wants !== p2Gender) return false;
    if (p2Wants && p2Wants !== 'everyone' && p2Wants !== p1Gender) return false;

    return true;
  }

  calculateCompatibility(p1, p2) {
    let score = 0;
    const overlapDetails = {
      interests: [],
      spotifyArtists: [],
      spotifyTracks: []
    };

    // Interests
    const p1Interests = p1.interests || [];
    const p2Interests = p2.interests || [];
    overlapDetails.interests = p1Interests.filter(i => p2Interests.includes(i));
    score += overlapDetails.interests.length * 10;

    // Spotify Artists
    const p1Artists = (p1.spotifyProfile?.artists || []).map(a => a.name);
    const p2Artists = (p2.spotifyProfile?.artists || []).map(a => a.name);
    overlapDetails.spotifyArtists = p1Artists.filter(a => p2Artists.includes(a));
    score += overlapDetails.spotifyArtists.length * 15;

    // Spotify Tracks
    const p1Tracks = (p1.spotifyProfile?.tracks || []).map(t => t.name);
    const p2Tracks = (p2.spotifyProfile?.tracks || []).map(t => t.name);
    overlapDetails.spotifyTracks = p1Tracks.filter(t => p2Tracks.includes(t));
    score += overlapDetails.spotifyTracks.length * 5;

    // Base score so it's not 0
    score += 10;

    // Cap score at 100 or leave as raw number. Raw is fine.
    const finalScore = Math.min(score, 100);

    return { score: finalScore, overlapDetails };
  }

  // Handle Accept/Decline
  async respondToMatch(userId, matchId, action) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    if (match.user1.toString() === userId.toString()) {
      match.user1Action = action;
    } else if (match.user2.toString() === userId.toString()) {
      match.user2Action = action;
    } else {
      throw new Error('Not authorized for this match');
    }

    if (action === 'declined') {
      match.status = 'declined';
    } else if (match.user1Action === 'accepted' && match.user2Action === 'accepted') {
      match.status = 'matched';
      match.matchedAt = new Date();
    }

    await match.save();
    return match;
  }

  // Process pending check-ins for all active matches
  async processCheckIns() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Handle 24h check-ins
    const pending24h = await Match.find({
      status: 'matched',
      matchedAt: { $lte: twentyFourHoursAgo },
      'checkIns.check24h.status': 'pending'
    });

    for (const match of pending24h) {
      match.checkIns.check24h.status = 'sent';
      match.checkIns.check24h.sentAt = now;
      await match.save();
      console.log(`24h check-in sent for match ${match._id}`);
    }

    // 2. Handle 1w check-ins
    const pending1w = await Match.find({
      status: 'matched',
      matchedAt: { $lte: oneWeekAgo },
      'checkIns.check1w.status': 'pending'
    });

    for (const match of pending1w) {
      match.checkIns.check1w.status = 'sent';
      match.checkIns.check1w.sentAt = now;
      await match.save();
      console.log(`1w check-in sent for match ${match._id}`);
    }
  }

  // Respond to a check-in
  async respondToCheckIn(userId, matchId, checkType, response) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    const checkKey = checkType === '24h' ? 'check24h' : 'check1w';
    const check = match.checkIns[checkKey];

    if (check.status !== 'sent') {
      throw new Error('Check-in not active or already completed');
    }

    if (match.user1.toString() === userId.toString()) {
      check.user1Response = response;
    } else if (match.user2.toString() === userId.toString()) {
      check.user2Response = response;
    } else {
      throw new Error('Not authorized');
    }

    // If either user says move_on, the match is dissolved
    if (response === 'move_on') {
      match.status = 'dissolved';
      check.status = 'completed';
    } else if (check.user1Response === 'yes' && check.user2Response === 'yes') {
      check.status = 'completed';
    }

    await match.save();
    return match;
  }

  // Get current active match
  async getCurrentMatch(userId) {
    // Find pending or matched
    const match = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['pending', 'matched'] }
    });
    return match;
  }

  // Check if user has a pending check-in they must respond to
  async getPendingCheckIn(userId) {
    const match = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'matched'
    });

    if (!match) return null;

    // Check 24h
    if (match.checkIns.check24h.status === 'sent') {
      const hasResponded = match.user1.toString() === userId.toString() 
        ? match.checkIns.check24h.user1Response 
        : match.checkIns.check24h.user2Response;
      if (!hasResponded) return { matchId: match._id, checkType: '24h' };
    }

    // Check 1w
    if (match.checkIns.check1w.status === 'sent') {
      const hasResponded = match.user1.toString() === userId.toString() 
        ? match.checkIns.check1w.user1Response 
        : match.checkIns.check1w.user2Response;
      if (!hasResponded) return { matchId: match._id, checkType: '1w' };
    }

    return null;
  }

  // Enter Waiting Pool
  async enterWaitingPool(userId) {
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new Error('Profile not found');
    
    // Check if already in an active match
    const activeMatch = await this.getCurrentMatch(userId);
    if (activeMatch) {
      throw new Error('You cannot enter the waiting pool while having an active match.');
    }

    profile.inWaitingPool = true;
    await profile.save();
    return profile;
  }
}

module.exports = new MatchService();
