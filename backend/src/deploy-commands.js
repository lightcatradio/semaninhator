import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as gridCommand from "./bot/commands/grid.js";

const commands = [gridCommand.data.toJSON()];

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

try {
  console.log("Registrando slash commands...");
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID,
      process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
  );

  console.log("Comandos registrados com sucesso.");
} catch (error) {
  console.error(error);
}
