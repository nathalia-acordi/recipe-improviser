import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "recipeimproviser";

let client;

export async function getMongoClient() {
  if (!client || !client.topology?.isConnected()) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function saveRecipe(recipe) {
  const cli = await getMongoClient();
  const db = cli.db(dbName);
  const col = db.collection("recipes");
  const result = await col.insertOne({ ...recipe, createdAt: new Date() });
  return result.insertedId;
}
