const BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

async function fetchLastfm(params) {
  const query = new URLSearchParams({
    ...params,
    api_key: process.env.LASTFM_API_KEY,
    format: 'json',
  });

  const response = await fetch(`${BASE_URL}?${query}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Last.fm error ${data.error}: ${data.message}`);
  }

  return data;
}

export async function getTopAlbums(username, period = 'overall') {
  const data = await fetchLastfm({
    method: 'user.getTopAlbums',
    user: username,
    period,
    limit: '25',
  });

  const albums = data.topalbums.album;

  return albums.map((album) => ({
    name: album.name,
    artist: album.artist.name,
    playcount: Number(album.playcount),
    coverUrl: album.image.find((img) => img.size === 'extralarge')?.['#text'] || null,
  }));
}

export async function getWeeklyStats(username) {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 7 * 24 * 60 * 60;

  const [recentData, albumsData, artistsData] = await Promise.all([
    fetchLastfm({ method: 'user.getRecentTracks', user: username, from: String(from), to: String(now), limit: '1' }),
    fetchLastfm({ method: 'user.getTopAlbums', user: username, period: '7day', limit: '1' }),
    fetchLastfm({ method: 'user.getTopArtists', user: username, period: '7day', limit: '15' }),
  ]);

  const totalScrobbles = Number(recentData.recenttracks['@attr'].total);
  const totalAlbums = Number(albumsData.topalbums['@attr'].total);
  const artistsList = artistsData.topartists.artist || [];
  const totalArtists = Number(artistsData.topartists['@attr'].total);

  const topTags = await getTopTagsFromArtists(artistsList);

  return { totalScrobbles, totalAlbums, totalArtists, topTags };
}

async function getTopTagsFromArtists(artists) {
  const tagWeights = new Map();

  await Promise.all(
    artists.slice(0, 10).map(async (artist) => {
      try {
        const data = await fetchLastfm({ method: 'artist.getTopTags', artist: artist.name });
        const tags = (data.toptags.tag || []).slice(0, 3);
        const weight = Number(artist.playcount) || 1;
        tags.forEach((tag) => {
          tagWeights.set(tag.name, (tagWeights.get(tag.name) || 0) + weight);
        });
      } catch { }
    })
  );

  return [...tagWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}