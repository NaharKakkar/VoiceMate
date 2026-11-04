import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const dataDir = path.join(process.cwd(), "server", "data");
const dataFile = path.join(dataDir, "db.json");
const RecordSchema = new mongoose.Schema({
  collection: { type: String, required: true, index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });
const Record = mongoose.models.VoiceMateRecord || mongoose.model("VoiceMateRecord", RecordSchema);
let mongoReady = false;

export async function initStore() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      mongoReady = true;
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      console.warn("MongoDB unavailable; using local JSON storage:", err.message);
    }
  }
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(dataFile); }
  catch { await fs.writeFile(dataFile, JSON.stringify({}), "utf8"); }
  console.log("Using local JSON storage at server/data/db.json");
}
async function readDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try { return JSON.parse(await fs.readFile(dataFile, "utf8")); }
  catch { return {}; }
}
async function writeDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2), "utf8");
}
export async function all(collection) {
  if (mongoReady) {
    const rows = await Record.find({ collection }).sort({ createdAt: -1 }).lean();
    return rows.map(r => r.payload);
  }
  const db = await readDb();
  return db[collection] || [];
}
export async function save(collection, item) {
  const record = { ...item, id: item.id || randomUUID(), updatedAt: new Date().toISOString() };
  if (mongoReady) {
    await Record.updateOne({ collection, "payload.id": record.id }, { $set: { collection, payload: record } }, { upsert: true });
  } else {
    const db = await readDb();
    db[collection] ||= [];
    const i = db[collection].findIndex(x => x.id === record.id);
    if (i >= 0) db[collection][i] = record; else db[collection].unshift(record);
    await writeDb(db);
  }
  return record;
}
export async function remove(collection, id) {
  if (mongoReady) await Record.deleteOne({ collection, "payload.id": id });
  else {
    const db = await readDb();
    db[collection] = (db[collection] || []).filter(x => x.id !== id);
    await writeDb(db);
  }
}
export async function clear(collection) {
  if (mongoReady) await Record.deleteMany({ collection });
  else {
    const db = await readDb(); db[collection] = []; await writeDb(db);
  }
}
export const storageMode = () => mongoReady ? "MongoDB" : "Local JSON";
