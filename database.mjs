import { MongoClient } from "mongodb";

// URI de conexão e nome do banco, vindos das variáveis de ambiente
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "recipeimproviser";

// Cliente MongoDB reutilizável (singleton)
let client;

// Retorna uma instância conectada do MongoClient (reutiliza se já existir)
export async function getMongoClient() {
  if (!client || !client.topology?.isConnected()) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

// Salva uma receita na coleção "recipes" do banco
export async function saveRecipe(recipe) {
  const cli = await getMongoClient(); // obtém conexão
  const db = cli.db(dbName); // seleciona banco
  const col = db.collection("recipes"); // seleciona coleção
  // Insere a receita (adiciona createdAt)
  const result = await col.insertOne({ ...recipe, createdAt: new Date() });
  return result.insertedId; // retorna o ID inserido
}
