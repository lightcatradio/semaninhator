import cron from "node-cron";
import { AttachmentBuilder } from "discord.js";
import { getTopAlbums } from "../services/lastfm.js";
import { generateGridImage } from "../services/grid-image.js";
import {
  listAllActiveSubscriptions,
  markAsPosted,
} from "../services/subscriptions.js";

const TIMEZONE = "America/Sao_Paulo";

const activeTasks = new Map();

async function postSemaninha(client, sub) {
  try {
    const channel = await client.channels.fetch(sub.channelId);
    const albums = await getTopAlbums(sub.lastfmUsername, "7day");
    const buffer = await generateGridImage(albums, {
      username: sub.lastfmUsername,
      period: "7day",
    });
    const attachment = new AttachmentBuilder(buffer, { name: "semaninha.png" });

    await channel.send({
      content: `Semaninha de **${sub.lastfmUsername}**`,
      files: [attachment],
    });
    await markAsPosted(sub.id);
    console.log(`Semaninha postada (#${sub.id})`);
  } catch (error) {
    console.error(`Falha ao postar semaninha #${sub.id}:`, error.message);
  }
}

export function scheduleSubscription(client, sub) {
  const [hour, minute] = sub.time.split(":").map(Number);
  const pattern = `${minute} ${hour} * * ${sub.dayOfWeek}`;

  const task = cron.schedule(pattern, () => postSemaninha(client, sub), {
    timezone: TIMEZONE,
  });
  activeTasks.set(sub.id, task);
  console.log(
    `Agendado #${sub.id}: ${sub.lastfmUsername} — dia ${sub.dayOfWeek} às ${sub.time}`
  );
}

export function unscheduleSubscription(id) {
  const task = activeTasks.get(id);
  if (task) {
    task.stop();
    activeTasks.delete(id);
  }
}

export async function loadAndScheduleAll(client) {
  const subscriptions = await listAllActiveSubscriptions();
  subscriptions.forEach((sub) => scheduleSubscription(client, sub));
  console.log(`${subscriptions.length} semaninha(s) agendada(s) ao iniciar`);
}
