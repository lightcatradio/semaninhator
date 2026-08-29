import "dotenv/config";
import client from "./bot/client.js";
import { startScheduler } from "./bot/scheduler.js";

client.once("ready", () => {
  startScheduler(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
