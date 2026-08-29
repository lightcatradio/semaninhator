import "dotenv/config.js";
import client from "./bot/client.js";

client.login(process.env.DISCORD_BOT_TOKEN);
