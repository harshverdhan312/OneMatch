const cron = require('node-cron');
const matchService = require('./match.service');
const checkInService = require('./checkin.service');
const Match = require('../models/Match');
const Profile = require('../models/Profile');

const startCronJobs = () => {
  // 1. Run every midnight: Daily Match Generation
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily match generation cron job...');
    try {
      await matchService.generateMatches();
    } catch (error) {
      console.error('Error generating matches via cron:', error);
    }
  });
  
  // 2. Run every hour: Process Check-ins
  cron.schedule('0 * * * *', async () => {
    console.log('Running check-in processing cron job...');
    try {
      await checkInService.triggerCheckIns();
    } catch (error) {
      console.error('Error triggering check-ins via cron:', error);
    }
  });

  // 3. Run every midnight: Match Expiry (48 hours)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running match expiry cron job...');
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      
      // Find pending matches older than 48h
      const expiredMatches = await Match.find({
        status: 'pending',
        createdAt: { $lte: fortyEightHoursAgo }
      });

      for (const match of expiredMatches) {
        match.status = 'declined'; // or a new state like 'expired'
        await match.save();

        // Put users back in pool
        await Profile.updateMany(
          { userId: { $in: [match.user1, match.user2] } },
          { $set: { inWaitingPool: true } }
        );
      }
      console.log(`Expired ${expiredMatches.length} pending matches.`);
    } catch (error) {
      console.error('Error expiring matches via cron:', error);
    }
  });

  console.log('Cron jobs scheduled.');
};

module.exports = { startCronJobs };
