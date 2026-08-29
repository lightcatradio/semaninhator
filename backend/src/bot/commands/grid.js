import { SlashCommandBuilder } from "discord.js";
import { getTopAlbums } from "../../services/lastfm.js";
import { generateGridImage } from "../../services/grid-image.js";
import { AttachmentBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("grid")
  .setDescription("Gera um grid 5x5 dos álbuns mais escutados no Last.fm")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Seu username no Last.fm")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("period")
      .setDescription("Período de tempo")
      .setRequired(true)
      .addChoices(
        { name: "7 dias", value: "7day" },
        { name: "1 mês", value: "1month" },
        { name: "3 meses", value: "3month" },
        { name: "6 meses", value: "6month" },
        { name: "12 meses", value: "12month" },
        { name: "Geral", value: "overall" }
      )
  );

export async function execute(interaction) {
  await interaction.deferReply();

  const username = interaction.options.getString("username");
  const period = interaction.options.getString("period");

  try {
    const albums = await getTopAlbums(username, period);
    const buffer = await generateGridImage(albums);

    const attachment = new AttachmentBuilder(buffer, { name: "grid.png" });

    await interaction.editReply({
      content: `Grid de **${username}** (${period})`,
      files: [attachment],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply(`Erro ao gerar o grid: ${error.message}`);
  }
}
