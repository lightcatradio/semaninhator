import "dotenv/config";
import { getTopAlbums } from "../services/lastfm.js";

const username = "Fewliperr";
const period = "7day";

const albums = await getTopAlbums(username, period);
console.log(`Top ${albums.length} álbuns de ${username} (${period}):`);
console.table(
  albums.map(({ name, artist, playcount }) => ({ name, artist, playcount }))
);
