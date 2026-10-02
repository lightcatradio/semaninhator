import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as semaninhaCommand from "./bot/commands/semaninha.js";

const commands = [semaninhaCommand.data.toJSON()];

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

const args = process.argv.slice(2);
console.log(`Quantidade de argumentos: ${args.length}`);

const clientId = process.env.DISCORD_CLIENT_ID;
const guildId  = process.env.DISCORD_GUILD_ID;

try {
    console.log("Limpando comandos registrados");

    console.log("Limpando comandos globais");
    await rest.put(Routes.applicationCommands(clientId), {
        body: []
    });

    console.log("Limpando comandos para o servidor");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: []
    });

    console.log("Todos os comandos registrados foram limpos");
    if (args.includes("--global")) {
        console.log("Registrando slash commands globalmente...");

        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
            body: commands,
        });

        console.log("Comandos globais registrados com sucesso.");
    } else {
        console.log("Registrando slash commands para servidor específico...");

        await rest.put(
            Routes.applicationGuildCommands(
                clientId,
                guildId
            ),
            { body: commands }
        );

        console.log("Comandos registrados no servidor com sucesso.");
    }
} catch (error) {
    console.error(error);
}
