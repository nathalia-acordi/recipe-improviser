function buildSystemPrompt({ style, diet }) {
  // Descrição do estilo de resposta
  const styleDesc =
    {
      simple: "Instruções curtas, linguagem clara, passos numerados",
      funny: "Seja muito engraçado. Faça piadas",
      gourmet: "Use ingredientes de alta qualidade e técnicas sofisticadas.",
      chaotic: "Misture tudo de forma aleatória e veja o que acontece!",
    }[style] || "Instruções claras e concisas.";

  // Regras/detalhes da dieta ou restrição alimentar
  const dietRules =
    {
      none: "Sem restrições específicas",
      vegan: "Sem ingredientes de origem animal",
      vegetarian: "Sem carne, mas pode incluir laticínios e ovos",
      gluten_free: "Sem glúten",
      low_cost: "Ingredientes acessíveis e econômicos",
      lactose_free: "Sem laticínios",
    }[diet] || "Sem restrições específicas.";

  // Prompt detalhado para o papel do assistente culinário
  return `Você é um assistente CULINÁRIO em PT-BR. Gere receitas seguras e realistas usando apenas os ingredientes informados (pode sugerir substitutos opcionais).\n- Estilo: ${styleDesc}\n- Dieta/Restrição: ${dietRules}\n- Saída ESTRITAMENTE em JSON com chaves: title, servings, time_minutes, ingredients_used, steps, tips, warnings.\nIMPORTANTE: NÃO use blocos de código markdown (não use crases, não use \`\`\`json), apenas retorne o JSON puro na resposta.`;
}

// Monta o prompt do usuário, listando ingredientes e porções desejadas
function buildUserPrompt({ ingredients, servings }) {
  return `Ingredientes disponíveis: ${ingredients.join(", ")}\nPorções: ${servings || 2}\nGere UMA receita que caiba em ~20-30 minutos, com 4-8 passos.`;
}


// Função principal para chamar a API da OpenAI e obter a receita
export async function callOpenAI({ style, diet, ingredients, servings }) {
  // Busca a chave da API do ambiente
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Variável de ambiente OPENAI_API_KEY ausente");

  // Controla timeout da requisição (15s)
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);

  try {
  // Monta o payload para a API da OpenAI
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

  // Envia requisição para a OpenAI
  console.log("[callOpenAI] Enviando payload para OpenAI...");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  // Resposta recebida
  console.log("[callOpenAI] Resposta recebida da OpenAI.");

  // Se a resposta não for OK, lança erro
  if (!res.ok) throw new Error(`Erro na resposta da OpenAI: código ${res.status}`);

  // Extrai JSON da resposta
  const data = await res.json();
  console.log("[callOpenAI] JSON da resposta da OpenAI extraído.");

    // Extrai o texto da resposta do modelo
    const text = data?.choices?.[0]?.message?.content?.trim() || "{}";
    console.log("Resposta bruta da OpenAI:", text);
    // Remove blocos markdown e tenta extrair apenas o JSON puro
    let jsonStr = text;
    jsonStr = jsonStr.replace(/```json|```/g, "");
    // Tenta extrair o primeiro objeto JSON válido
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) jsonStr = match[0];
    try {
      const parsed = JSON.parse(jsonStr);
      console.log("[callOpenAI] JSON.parse bem-sucedido.");
      return parsed;
    } catch (e) {
      // Caso o JSON não seja válido
      console.error("Erro ao interpretar o JSON retornado pela OpenAI:", text);
      throw new Error("A resposta da OpenAI não está em JSON válido. Tente novamente.");
    }
  } catch (err) {
    // Captura erros gerais e de timeout
    console.error("[callOpenAI] Erro geral:", err);
    if (err.name === "AbortError") {
      throw new Error("A chamada para a OpenAI excedeu o tempo limite. Tente novamente em alguns segundos.");
    }
    throw err;
  } finally {
    // Limpa o timeout
    clearTimeout(t);
  }
}





