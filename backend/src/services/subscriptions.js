import { db } from "../lib/firebase.js";

const collection = db.collection("subscriptions");

export async function createSubscription({
  guildId,
  channelId,
  lastfmUsername,
  period,
  frequency,
  createdBy,
}) {
  const docRef = await collection.add({
    guildId,
    channelId,
    lastfmUsername,
    period,
    frequency,
    active: true,
    lastPostedAt: null,
    createdBy,
    createdAt: new Date(),
  });
  return { id: docRef.id, lastfmUsername, period, frequency };
}

export async function listSubscriptionsByGuild(guildId) {
  const snapshot = await collection
    .where("guildId", "==", guildId)
    .where("active", "==", true)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

const INTERVAL_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

export async function listDueSubscriptions() {
  const snapshot = await collection.where("active", "==", true).get();
  const now = Date.now();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((sub) => {
      if (!sub.lastPostedAt) return true;
      const lastPosted = sub.lastPostedAt.toDate().getTime();
      return now - lastPosted >= INTERVAL_MS[sub.frequency];
    });
}

export async function markAsPosted(id) {
  await collection.doc(id).update({ lastPostedAt: new Date() });
}

export async function deactivateSubscription(id, guildId) {
  const doc = await collection.doc(id).get();
  if (!doc.exists || doc.data().guildId !== guildId) return false;
  await collection.doc(id).update({ active: false });
  return true;
}
