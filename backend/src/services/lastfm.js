const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

export async function getTopAlbums(username, period = "overall") {
  const params = new URLSearchParams({
    method: "user.getTopAlbums",
    user: username,
    api_key: process.env.LASTFM_API_KEY,
    period,
    limit: "25",
    format: "json",
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Last.fm error ${data.error}: ${data.message}`);
  }

  const albums = data.topalbums.album;

  return albums.map((album) => ({
    name: album.name,
    artist: album.artist.name,
    playcount: Number(album.playcount),
    coverUrl:
      album.image.find((img) => img.size === "extralarge")?.["#text"] || null,
  }));
}
