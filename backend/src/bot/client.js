import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import * as semaninhaCommand from "./commands/semaninha.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Conectado como ${client.user.tag}`);

  client.user.setActivity("Seus scrobbles", {
    type: ActivityType.Watching,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "semaninha") {
    await semaninhaCommand.execute(interaction);
  }
});

export default client;
