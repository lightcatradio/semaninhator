import { db } from "../lib/firebase.js";

const collection = db.collection("subscriptions");

export async function createSubscription({
  guildId,
  channelId,
  lastfmUsername,
  dayOfWeek,
  time,
  createdBy,
}) {
  const docRef = await collection.add({
    guildId,
    channelId,
    lastfmUsername,
    dayOfWeek,
    time,
    active: true,
    lastPostedAt: null,
    createdBy,
    createdAt: new Date(),
  });

  return {
    id: docRef.id,
    guildId,
    channelId,
    lastfmUsername,
    dayOfWeek,
    time,
    active: true,
    lastPostedAt: null,
    createdBy,
  };
}

export async function listSubscriptionsByGuild(guildId) {
  const snapshot = await collection
    .where("guildId", "==", guildId)
    .where("active", "==", true)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function listAllActiveSubscriptions() {
  const snapshot = await collection.where("active", "==", true).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
