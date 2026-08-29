import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { getTopAlbums } from "../../services/lastfm.js";
import { generateGridImage } from "../../services/grid-image.js";
import {
  createSubscription,
  listSubscriptionsByGuild,
  deactivateSubscription,
} from "../../services/subscriptions.js";

const PERIOD_CHOICES = [
  { name: "7 dias", value: "7day" },
  { name: "1 mês", value: "1month" },
  { name: "3 meses", value: "3month" },
  { name: "6 meses", value: "6month" },
  { name: "12 meses", value: "12month" },
  { name: "Geral", value: "overall" },
];

const FREQUENCY_CHOICES = [
  { name: "Diário", value: "daily" },
  { name: "Semanal", value: "weekly" },
  { name: "Mensal", value: "monthly" },
];

export const data = new SlashCommandBuilder()
  .setName("grid")
  .setDescription("Gera grids 5x5 dos álbuns mais escutados no Last.fm")
  .addSubcommand((sub) =>
    sub
      .setName("gerar")
      .setDescription("Gera um grid único, agora")
      .addStringOption((o) =>
        o
          .setName("username")
          .setDescription("Username no Last.fm")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("period")
          .setDescription("Período")
          .setRequired(true)
          .addChoices(...PERIOD_CHOICES)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("automatizar")
      .setDescription("Configura postagem automática recorrente neste canal")
      .addStringOption((o) =>
        o
          .setName("username")
          .setDescription("Username no Last.fm")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("period")
          .setDescription("Período")
          .setRequired(true)
          .addChoices(...PERIOD_CHOICES)
      )
      .addStringOption((o) =>
        o
          .setName("frequency")
          .setDescription("Frequência")
          .setRequired(true)
          .addChoices(...FREQUENCY_CHOICES)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("listar")
      .setDescription("Lista as automações ativas neste servidor")
  )
  .addSubcommand((sub) =>
    sub
      .setName("pausar")
      .setDescription("Desativa uma automação")
      .addStringOption((o) =>
        o
          .setName("id")
          .setDescription("ID da automação (veja em /grid listar)")
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === "gerar") return handleGerar(interaction);
  if (subcommand === "automatizar") return handleAutomatizar(interaction);
  if (subcommand === "listar") return handleListar(interaction);
  if (subcommand === "pausar") return handlePausar(interaction);
}

async function handleGerar(interaction) {
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
    await interaction.editReply(`❌ Erro ao gerar o grid: ${error.message}`);
  }
}

async function handleAutomatizar(interaction) {
  await interaction.deferReply();
  const username = interaction.options.getString("username");
  const period = interaction.options.getString("period");
  const frequency = interaction.options.getString("frequency");

  const subscription = await createSubscription({
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    lastfmUsername: username,
    period,
    frequency,
    createdBy: interaction.user.id,
  });

  await interaction.editReply(
    `✅ Automação criada (id: ${subscription.id}). Vou postar o grid de **${username}** (${period}) neste canal, frequência **${frequency}**.`
  );
}

async function handleListar(interaction) {
  await interaction.deferReply();
  const subscriptions = await listSubscriptionsByGuild(interaction.guildId);

  if (subscriptions.length === 0)
    return interaction.editReply("Nenhuma automação ativa neste servidor.");

  const lines = subscriptions.map(
    (s) =>
      `**#${s.id}** — ${s.lastfmUsername} (${s.period}, ${s.frequency}) em <#${s.channelId}>`
  );
  await interaction.editReply(lines.join("\n"));
}

async function handlePausar(interaction) {
  await interaction.deferReply();
  const id = interaction.options.getString("id");
  const success = await deactivateSubscription(id, interaction.guildId);
  await interaction.editReply(
    success ? `⏸️ Automação #${id} desativada.` : `❌ Automação não encontrada.`
  );
}
