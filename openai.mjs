function buildSystemPrompt({ style, diet }) {
  const styleDesc =
    {
      simple: "Instruções curtas, linguagem clara, passos numerados",
      funny: "Seja muito engraçado. Faça piadas",
      gourmet: "Use ingredientes de alta qualidade e técnicas sofisticadas.",
      chaotic: "Misture tudo de forma aleatória e veja o que acontece!",
    }[style] || "Instruções claras e concisas.";

  const dietRules =
    {
      none: "Sem restrições específicas",
      vegan: "Sem ingredientes de origem animal",
      vegetarian: "Sem carne, mas pode incluir laticínios e ovos",
      gluten_free: "Sem glúten",
      low_cost: "Ingredientes acessíveis e econômicos",
      lactose_free: "Sem laticínios",
    }[diet] || "Sem restrições específicas.";

  return `Você é um assistente CULINÁRIO em PT-BR. Gere receitas seguras e realistas usando apenas os ingredientes informados (pode sugerir substitutos opcionais).
- Estilo: ${styleDesc}        
- Dieta/Restrição: ${dietRules}
- Saída ESTRITAMENTE em JSON com chaves: title, servings, time_minutes, ingredients_used, steps, tips, warnings.`;
}

export async function callOpenAI({ style, diet, ingredients, servings }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY ausente");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt({ style, diet }) },
        { role: "user", content: buildUserPrompt({ ingredients, servings }) },
      ],
      temperature:
        style === "funny" || style === "chaotic"
          ? 0.9
          : style === "gourmet"
          ? 0.7
          : 0.4,
      max_tokens: 500,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);

    const data = await res.json();

    const text = data?.choices?.[0]?.message?.content?.trim() || "{}";

    return JSON.parse(text.replace(/```json|```/g, ""));
  } finally {
    clearTimeout(t);
  }
}
