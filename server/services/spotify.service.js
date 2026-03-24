class SpotifyService {
  async fetchAndNormalize(accessToken) {
    // In production, this would make authenticated requests to Spotify API:
    // GET https://api.spotify.com/v1/me/top/artists
    // GET https://api.spotify.com/v1/me/top/tracks
    
    // For MVP demonstration, logging structure and returning mocked/payload
    const mockRawData = {
      artists: {
        items: [] // Populated from API
      },
      tracks: {
        items: [] // Populated from API
      },
      playlists: {
        items: [] // Populated from API
      }
    };

    return this.normalize(mockRawData);
  }

  normalize(rawData) {
    const artists = (rawData.artists?.items || []).map(artist => ({
      id: artist.id,
      name: artist.name,
      images: artist.images?.map(img => img.url) || [],
      uri: artist.uri
    }));

    const tracks = (rawData.tracks?.items || []).map(track => ({
      id: track.id,
      name: track.name,
      images: track.album?.images?.map(img => img.url) || [],
      uri: track.uri
    }));

    const playlists = (rawData.playlists?.items || []).map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      images: playlist.images?.map(img => img.url) || [],
      uri: playlist.uri
    }));

    return { artists, tracks, playlists };
  }
}

module.exports = new SpotifyService();
