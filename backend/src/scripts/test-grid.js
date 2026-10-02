import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { getTopAlbums } from "../services/lastfm.js";
import { generateGridImage } from "../services/grid-image.js";
import { GlobalFonts } from "@napi-rs/canvas";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("ERRO: Nome de usuário não providenciado");
    console.log("USO: test-grid.js <username> [opções]")
    console.log(`OPÇÕES:
    -n mostrar nomes dos álbuns
    -p mostrar plays dos álbuns
`)
    process.exit(1);
}

GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Sans', 'NotoSans-Regular.ttf'), 'NotoSans')
GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Sans_JP', 'NotoSansJP-Regular.ttf'), 'NotoSansJP')
GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Sans_KR', 'NotoSansKR-Regular.ttf'), 'NotoSansKR')
GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Sans_SC', 'NotoSansSC-Regular.ttf'), 'NotoSansSC')
GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Sans_TC', 'NotoSansTC-Regular.ttf'), 'NotoSansTC')
GlobalFonts.registerFromPath(join(__dirname, '../', 'assets', 'fonts', 'Noto_Color_Emoji', 'NotoColorEmoji-Regular.ttf'), 'NotoColorEmoji')

console.log('Fontes carregadas:', GlobalFonts.families)

const username = args[0];
const period   = "7day";
const filename = `${username}-semaninha.png`;

const albums = await getTopAlbums(username, period);
const buffer = await generateGridImage(albums, args.includes("-n"), args.includes("-p"));

await writeFile(filename, buffer);
console.log(`Semaninha de ${username} salva em ${filename}`);
