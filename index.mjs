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