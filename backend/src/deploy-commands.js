import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as semaninhaCommand from "./bot/commands/semaninha.js";

const commands = [semaninhaCommand.data.toJSON()];

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

try {
  console.log("Registrando slash commands globalmente...");

  await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
    body: commands,
  });

  console.log("Comandos globais registrados com sucesso.");
} catch (error) {
  console.error(error);
}
