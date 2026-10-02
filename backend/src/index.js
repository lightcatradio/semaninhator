import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import "dotenv/config";
import client from "./bot/client.js";
import { loadAndScheduleAll } from "./bot/scheduler.js";
import { GlobalFonts } from "@napi-rs/canvas";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Sans', 'NotoSans-Regular.ttf'), 'NotoSans')
GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Sans_JP', 'NotoSansJP-Regular.ttf'), 'NotoSansJP')
GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Sans_KR', 'NotoSansKR-Regular.ttf'), 'NotoSansKR')
GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Sans_SC', 'NotoSansSC-Regular.ttf'), 'NotoSansSC')
GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Sans_TC', 'NotoSansTC-Regular.ttf'), 'NotoSansTC')
GlobalFonts.registerFromPath(join(__dirname, 'assets', 'fonts', 'Noto_Color_Emoji', 'NotoColorEmoji-Regular.ttf'), 'NotoColorEmoji')

console.log('Fontes carregadas:', GlobalFonts.families)


client.once("ready", () => {
  loadAndScheduleAll(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);

process.on("exit", (code) => {
    console.log("Destruindo o cliente");
    client.destroy();
    console.log(`Encerrando com o código: ${code}`);
});
