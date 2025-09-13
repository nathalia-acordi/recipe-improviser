import mongoose from "mongoose";

const uri = process.env.MONGODB_URI; 
const dbName = process.env.MONGODB_DB || "recipeimproviser";

const recipeSchema = new mongoose.Schema({
  title: String,
  servings: Number,
  time_minutes: Number,
  ingredients_used: [String],
  steps: [String],
  tips: [String],
  warnings: [String],
  style: String,
  diet: String,
  requested_ingredients: [String]
}, { timestamps: true });

// Singleton para evitar múltiplas conexões
let Recipe;
if (mongoose.models.Recipe) {
  Recipe = mongoose.model("Recipe");
} else {
  Recipe = mongoose.model("Recipe", recipeSchema);
}

export async function connectMongoose() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 5000 });
      console.log("[Mongoose] Conectado com sucesso!");
    } catch (err) {
      console.error("[Mongoose] Erro ao conectar:", err);
      throw err;
    }
  }
}

export async function saveRecipe(recipe) {
  try {
    await connectMongoose();
    const doc = new Recipe(recipe);
    await doc.save();
    console.log("[Mongoose] Receita salva com sucesso! ID:", doc._id);
    return doc._id;
  } catch (err) {
    console.error("[Mongoose] Erro ao salvar receita:", err);
    throw err;
  }
}
