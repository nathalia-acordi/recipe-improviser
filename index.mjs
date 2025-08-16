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
