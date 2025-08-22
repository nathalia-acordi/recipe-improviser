const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function json(status, data) {
    return {
        statusCode: status,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };
}

const STYLES = new Set(["simple", "funny", "gourmet", "chaotic"]);
const DIETS = new Set(["none", "vegan", "vegetarian", "gluten_free", "lactose_free", "low_cost"]);

function buildSystemPrompt({ style, diet }) {
    const styleDesc = {
        simple: "Instruções curtas, linguagem clara, passos numerados.",
        funny: "Seja muito engraçado. Faça piadas",
        gourmet: "Toque de chef. Finja ser a Helena Rizzo do Masterchef",
        chaotic: "Criativo e ousado, mas SEM combinações perigosas. Fale como se você fosse um vilão"
    }[style] || "Instruções claras e concisas.";

    const dietRules = {
        none: "Sem restrições específicas.",
        vegan: "Sem ingredientes de origem animal; ofereça substituições.",
        vegetarian: "Sem carnes; ovos e laticínios permitidos.",
        gluten_free: "Evite glúten; sugira substituições seguras.",
        lactose_free: "Evite laticínios; sugira substituições sem lactose.",
        low_cost: "Priorize baixo custo e poucos passos."
    }[diet] || "Sem restrições específicas.";

    return `Você é um assistente CULINÁRIO em PT-BR. Gere receitas seguras e realistas usando apenas os ingredientes informados (pode sugerir substitutos opcionais).
- Estilo: ${styleDesc}
- Dieta/Restrição: ${dietRules}
- Garanta segurança alimentar básica (cozinhar carnes/ovos completamente; alertar alergênicos).
- Saída ESTRITAMENTE em JSON com chaves: title, servings, time_minutes, ingredients_used, steps, tips, warnings.
- Não inclua explicações fora do JSON.`;
}

function buildUserPrompt({ ingredients, servings }) {
    return `Ingredientes disponíveis: ${ingredients.join(", ")}
Porções (servings): ${servings || 2}
Gere UMA receita que caiba em ~20-30 minutos, com 4-8 passos.`;
}

async function callOpenAI({ style, diet, ingredients, servings }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY ausente");
}

const controller = new AbortController();
const t = setTimeout(() => controller.abort(), 8000);

try {
    const payload = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: buildSystemPrompt({ style, diet }) },
            { role: "user", content: buildUserPrompt({ ingredients, servings }) }
        ],
        temperature: style === "funny" || style === "chaotic" ? 0.9 : style === "gourmet" ? 0.7 : 0.4,
        max_tokens: 500
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`OpenAI error: ${res.status} ${msg}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "{}";
    const cleaned = text.replace(/```json|```/g, "");
    return JSON.parse(cleaned);
} finally {
    clearTimeout(t);
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path   = event.requestContext?.http?.path   || event.path || "/";
  console.log("REQ", { method, path });

  // CORS preflight
  if (method === "OPTIONS") return { statusCode: 204, headers: CORS };

  // Healthcheck
  if (method === "GET" && path === "/health") {
    return json(200, { ok: true });
  }

  // Apenas /recipe
  if (!(method === "POST" && path === "/recipe")) {
    return json(404, { error: "Rota não encontrada" });
  }

  try {
    let body;
    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
    } catch (e) {
      console.error("JSON parse error", e);
      return json(400, { error: "Body inválido. Envie JSON." });
    }

    const ingredients = Array.isArray(body.ingredients) ? body.ingredients.map(String).map(s => s.trim()).filter(Boolean) : [];
    if (ingredients.length === 0) return json(400, { error: "Forneça 'ingredients' como array de strings." });

    const servings = Number(body.servings || 2);
    const style = (body.style || "simple").toLowerCase();
    const diet  = (body.diet  || "none").toLowerCase();

    if (!STYLES.has(style)) return json(400, { error: `style inválido. Use: ${[...STYLES].join(", ")}` });
    if (!DIETS.has(diet))   return json(400, { error: `diet inválido. Use: ${[...DIETS].join(", ")}` });

    if ((ingredients.join(",")).length > 600) return json(413, { error: "Lista de ingredientes muito longa para a demo." });

    // Modo offline (mock)
    if (process.env.SKIP_OPENAI === "1") {
      console.log("SKIP_OPENAI=1 ativo");
      return json(200, {
        title: "Receita fake para teste",
        servings,
        time_minutes: 15,
        ingredients_used: ingredients,
        steps: ["Passo 1", "Passo 2", "Passo 3"],
        tips: ["Teste sem chamar OpenAI"],
        warnings: []
      });
    }

    const result = await callOpenAI({ style, diet, ingredients, servings });

    const response = {
      title: result.title || "Receita improvisada",
      servings: result.servings || servings,
      time_minutes: result.time_minutes || 20,
      ingredients_used: Array.isArray(result.ingredients_used) ? result.ingredients_used : ingredients,
      steps: Array.isArray(result.steps) ? result.steps : ["Misture tudo e cozinhe com cuidado."],
      tips: Array.isArray(result.tips) ? result.tips : [],
      warnings: Array.isArray(result.warnings) ? result.warnings : []
    };

    console.log("RES", response.title);
    return json(200, response);
  } catch (err) {
    console.error("ERR", err);
    return json(502, { error: "Falha ao gerar a receita. Tente novamente." });
  }
};

// Empacotando para deploy (Lambda)
// macOS/Linux:   zip -r function.zip index.mjs package.json
// Windows (PowerShell): Compress-Archive -Path index.mjs,package.json -DestinationPath function.zip -Force


