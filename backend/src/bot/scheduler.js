import cron from "node-cron";
import { AttachmentBuilder } from "discord.js";
import { getTopAlbums } from "../services/lastfm.js";
import { generateGridImage } from "../services/grid-image.js";
import {
  listDueSubscriptions,
  markAsPosted,
} from "../services/subscriptions.js";

export async function checkAndPostDueSubscriptions(client) {
  console.log("Checando automações pendentes...");
  const due = await listDueSubscriptions();

  for (const sub of due) {
    try {
      const channel = await client.channels.fetch(sub.channelId);
      const albums = await getTopAlbums(sub.lastfmUsername, sub.period);
      const buffer = await generateGridImage(albums);
      const attachment = new AttachmentBuilder(buffer, { name: "grid.png" });

      await channel.send({
        content: `Grid automático de **${sub.lastfmUsername}** (${sub.period})`,
        files: [attachment],
      });
      await markAsPosted(sub.id);
      console.log(`Postado grid da automação #${sub.id}`);
    } catch (error) {
      console.error(`Falha na automação #${sub.id}:`, error.message);
    }
  }
}

export function startScheduler(client) {
  cron.schedule("0 * * * *", () => checkAndPostDueSubscriptions(client));
  console.log("Scheduler iniciado (checagem a cada hora)");
}
