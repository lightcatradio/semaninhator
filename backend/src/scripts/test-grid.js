import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { getTopAlbums } from "../services/lastfm.js";
import { generateGridImage } from "../services/grid-image.js";

const username = "Fewliperr";
const period = "7day";

const albums = await getTopAlbums(username, period);
const buffer = await generateGridImage(albums);

await writeFile("grid-teste.png", buffer);
console.log("Grid salvo em grid-teste.png");
