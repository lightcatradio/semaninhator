import "dotenv/config";
import client from "./bot/client.js";
import { loadAndScheduleAll } from "./bot/scheduler.js";

client.once("ready", () => {
  loadAndScheduleAll(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
