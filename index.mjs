import { json, STYLES, DIETS } from "./utils.mjs";
import { callOpenAI } from "./openai.mjs";
import { saveRecipe } from "./database.mjs";

export const handler = async (event, context) => {
  // Evita que a Lambda espere a conexão do MongoDB ser fechada
  if (context) context.callbackWaitsForEmptyEventLoop = false;

  // Detecta método e rota
  const method = event?.requestContext?.http?.method || event?.httpMethod || "GET";
  const path = event?.requestContext?.http?.path || event?.path || "/";

  // Healthcheck
  if (method === "GET" && path === "/health") {
    return json(200, { ok: true, service: "recipe-api", version: "1.0.0" });
  }

  // Só aceita POST /recipe
  if (!(method === "POST" && path === "/recipe")) {
    return json(404, { error: "Rota não encontrada", method, path });
  }

  // Parse do body
  let body;
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};
  } catch (e) {
    console.error("JSON parse error:", e);
    return json(400, {
      error: "Body inválido. Envie JSON válido no Content-Type application/json.",
    });
  }

  // Validação dos ingredientes
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map(String).map((s) => s.trim()).filter(Boolean)
    : [];
  if (ingredients.length === 0) {
    return json(400, {
      error: "Forneça 'ingredients' como array de strings não vazio.",
    });
  }

  // Validação de porções, estilo e dieta
  const servings = Number(body.servings || 2);
  const style = (body.style || "simple").toLowerCase();
  const diet = (body.diet || "none").toLowerCase();

  if (!STYLES.has(style)) {
    return json(400, {
      error: `style inválido. Valores aceitos: ${[...STYLES].join(", ")}`,
    });
  }
  if (!DIETS.has(diet)) {
    return json(400, {
      error: `diet inválido. Valores aceitos: ${[...DIETS].join(", ")}`,
    });
  }

  // Limite de tamanho para ingredientes (proteção demo)
  const rawSize = ingredients.join(",").length;
  if (rawSize > 600) {
    return json(413, {
      error: "Lista de ingredientes muito longa para a demo.",
    });
  }

  // Modo mock para testes locais
  if (process.env.SKIP_OPENAI === "1") {
    return json(200, {
      title: "Receita fake para teste (mock)",
      servings,
      time_minutes: 15,
      ingredients_used: ingredients,
      steps: [
        "Refogue os ingredientes.",
        "Cozinhe por 10 minutos.",
        "Ajuste sal e sirva.",
      ],
      tips: ["Dica mock: adicione cheiro-verde no final."],
      warnings: [],
    });
  }

  // Chamada principal
  try {
    const result = await callOpenAI({ style, diet, ingredients, servings });
    console.log("Resultado bruto da OpenAI:", result);

    // Monta resposta padronizada
    const response = {
      title: result?.title ?? "Receita improvisada",
      servings: result?.servings ?? servings,
      time_minutes: result?.time_minutes ?? 20,
      ingredients_used: Array.isArray(result?.ingredients_used)
        ? result.ingredients_used
        : ingredients,
      steps: Array.isArray(result?.steps)
        ? result.steps
        : ["Misture tudo e cozinhe com cuidado."],
      tips: Array.isArray(result?.tips) ? result.tips : [],
      warnings: Array.isArray(result?.warnings) ? result.warnings : [],
    };


    // Salva receita no MongoDB (não bloqueia resposta)
    saveRecipe({
      ...response,
      style,
      diet,
      requested_ingredients: ingredients
    }).catch((dbErr) => {
      console.error("Erro ao salvar no MongoDB:", dbErr);
    });

    console.log("Receita gerada:", {
      title: response.title,
      servings: response.servings,
    });
    return json(200, response);
  } catch (err) {
    console.error("Chamada à OpenAI falhou:", err);
    if (process.env.NODE_ENV === "development") {
      return json(502, { error: "Falha ao gerar a receita.", details: String(err && err.stack || err) });
    }
    return json(502, { error: "Falha ao gerar a receita. Tente novamente." });
  }
};
