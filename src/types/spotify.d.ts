declare module 'spotify-web-api-node' {
  export default class SpotifyWebApi {
    constructor(options: { accessToken: string });
    getFeaturedPlaylists(options: { limit: number }): Promise<any>;
    getUserPlaylists(options: { limit: number }): Promise<any>;
    getPlaylistTracks(playlistId: string): Promise<any>;
    searchTracks(query: string, options: { limit: number }): Promise<any>;
    setAccessToken(token: string): void;
  }
}
