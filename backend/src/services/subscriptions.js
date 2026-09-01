import { db } from "../lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const collection = db.collection("subscriptions");

const ID_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";

function generateId() {
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

async function generateUniqueId() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateId();
    const doc = await collection.doc(id).get();
    if (!doc.exists) return id;
  }
  throw new Error("Não foi possível gerar um ID único após várias tentativas.");
}

export async function createSubscription({
  guildId,
  channelId,
  lastfmUsername,
  dayOfWeek,
  time,
  createdBy,
}) {
  const id = await generateUniqueId();

  const data = {
    guildId,
    channelId,
    lastfmUsername,
    dayOfWeek,
    time,
    active: true,
    postCount: 0,
    lastPostedAt: null,
    createdBy,
    createdAt: new Date(),
  };

  await collection.doc(id).set(data);

  return { id, ...data };
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

export async function incrementPostCount(id) {
  const ref = collection.doc(id);
  await ref.update({ postCount: FieldValue.increment(1) });
  const doc = await ref.get();
  return doc.data().postCount;
}
