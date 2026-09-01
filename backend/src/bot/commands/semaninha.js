import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { getTopAlbums, getWeeklyStats } from "../../services/lastfm.js";
import { generateGridImage } from "../../services/grid-image.js";
import {
  createSubscription,
  listSubscriptionsByGuild,
  deactivateSubscription,
} from "../../services/subscriptions.js";
import { scheduleSubscription, unscheduleSubscription } from "../scheduler.js";
import { buildSemaninhaMessage } from "../../services/semaninha-message.js";

const DAY_CHOICES = [
  { name: "Domingo", value: "0" },
  { name: "Segunda", value: "1" },
  { name: "Terça", value: "2" },
  { name: "Quarta", value: "3" },
  { name: "Quinta", value: "4" },
  { name: "Sexta", value: "5" },
  { name: "Sábado", value: "6" },
];

const DAY_LABELS = Object.fromEntries(
  DAY_CHOICES.map((d) => [d.value, d.name])
);
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const data = new SlashCommandBuilder()
  .setName("semaninha")
  .setDescription("Grid 5x5 dos álbuns mais escutados na semana, via Last.fm")
  .addSubcommand((sub) =>
    sub
      .setName("gerar")
      .setDescription("Gera a semaninha agora, sem agendar")
      .addStringOption((o) =>
        o
          .setName("username")
          .setDescription("Username no Last.fm")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("agendar")
      .setDescription("Agenda postagem semanal automática neste canal")
      .addStringOption((o) =>
        o
          .setName("username")
          .setDescription("Username no Last.fm")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("dia")
          .setDescription("Dia da semana")
          .setRequired(true)
          .addChoices(...DAY_CHOICES)
      )
      .addStringOption((o) =>
        o
          .setName("hora")
          .setDescription("Horário, formato 24h (ex: 18:00)")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("listar")
      .setDescription("Lista as semaninhas agendadas neste servidor")
  )
  .addSubcommand((sub) =>
    sub
      .setName("desativar")
      .setDescription("Desativa uma semaninha agendada")
      .addStringOption((o) =>
        o
          .setName("id")
          .setDescription("ID (veja em /semaninha listar)")
          .setRequired(true)
      )
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === "gerar") return handleGerar(interaction);
  if (subcommand === "agendar") return handleAgendar(interaction);
  if (subcommand === "listar") return handleListar(interaction);
  if (subcommand === "desativar") return handleDesativar(interaction);
}

async function handleGerar(interaction) {
  await interaction.deferReply();
  const username = interaction.options.getString("username");

  try {
    const albums = await getTopAlbums(username, "7day");
    const stats = await getWeeklyStats(username);
    const buffer = await generateGridImage(albums, {
      username,
      period: "7day",
    });
    const attachment = new AttachmentBuilder(buffer, { name: "semaninha.png" });
    const content = buildSemaninhaMessage({
      username,
      weekNumber: null,
      stats,
    });
    await interaction.editReply({ content, files: [attachment] });
  } catch (error) {
    console.error(error);
    await interaction.editReply(`Erro ao gerar a semaninha: ${error.message}`);
  }
}

async function handleAgendar(interaction) {
  const username = interaction.options.getString("username");
  const dayOfWeek = interaction.options.getString("dia");
  const time = interaction.options.getString("hora");

  if (!TIME_REGEX.test(time)) {
    return interaction.reply({
      content: "Horário inválido. Use formato 24h, ex: `18:00`.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const subscription = await createSubscription({
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    lastfmUsername: username,
    dayOfWeek,
    time,
    createdBy: interaction.user.id,
  });

  scheduleSubscription(interaction.client, subscription); // agenda na hora, sem precisar reiniciar

  await interaction.editReply(
    `Semaninha agendada (id: ${subscription.id}). Vou postar o grid de **${username}** toda ${DAY_LABELS[dayOfWeek]} às ${time}.`
  );
}

async function handleListar(interaction) {
  await interaction.deferReply();
  const subscriptions = await listSubscriptionsByGuild(interaction.guildId);

  if (subscriptions.length === 0)
    return interaction.editReply("Nenhuma semaninha agendada neste servidor.");

  const lines = subscriptions.map(
    (s) =>
      `**#${s.id}** — ${s.lastfmUsername}, toda ${DAY_LABELS[s.dayOfWeek]} às ${
        s.time
      } em <#${s.channelId}>`
  );
  await interaction.editReply(lines.join("\n"));
}

async function handleDesativar(interaction) {
  await interaction.deferReply();
  const id = interaction.options.getString("id");
  const success = await deactivateSubscription(id, interaction.guildId);
  if (success) unscheduleSubscription(id);
  await interaction.editReply(
    success ? `Semaninha #${id} desativada.` : `Semaninha não encontrada.`
  );
}
