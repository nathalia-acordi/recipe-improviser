

<div align="center">

# 🥘 Recipe Improviser

<b>Gere receitas criativas a partir dos ingredientes que você tem em casa!</b><br>
<sub>API serverless (AWS Lambda + API Gateway) • ChatGPT (OpenAI) • MongoDB</sub>

</div>

---


## 🗂️ O que faz cada arquivo principal?

| Arquivo        | Função |
| -------------- | ------ |
| **index.mjs**  | Ponto de entrada da API. Faz o roteamento das requisições, valida os dados recebidos, chama a OpenAI para gerar a receita e salva o resultado no banco de dados. |
| **openai.mjs** | Responsável por montar os prompts (instruções) e fazer a chamada à API da OpenAI (ChatGPT), além de tratar e validar a resposta recebida. |
| **database.mjs** | Gerencia a conexão com o MongoDB e salva as receitas geradas na coleção `recipes`. |
| **utils.mjs**  | Contém funções utilitárias (como resposta JSON padronizada) e listas de estilos e dietas aceitos, usadas para validação e padronização. |



## ✨ Funcionalidades

- 🍳 <b>Geração de receitas</b> a partir de ingredientes informados
- 🎭 <b>Estilos:</b> <code>simple</code>, <code>funny</code>, <code>gourmet</code>, <code>chaotic</code>
- 🥦 <b>Restrições alimentares:</b> <code>vegan</code>, <code>vegetarian</code>, <code>gluten-free</code>, <code>lactose-free</code>, <code>low-cost</code>
- 🩺 <b>Endpoint de saúde:</b> <code>GET /health</code>
- 🧪 <b>Modo offline</b> para testes (ignora chamada à OpenAI)
- 💾 <b>Salva receitas no MongoDB</b> automaticamente
- 📦 <b>Deploy simples</b> em um único Lambda


---

## 🚀 Como usar

### Pré-requisitos

- Conta AWS (Lambda + API Gateway)
- Node.js 18+
- Chave da OpenAI (`OPENAI_API_KEY`)
- Instância ou cluster MongoDB acessível pela Lambda (`MONGODB_URI`)

### Deploy

<details>
<summary><b>1. Empacote seu código-fonte</b></summary>

Inclua apenas os arquivos `.mjs` e `package.json` (NÃO inclua `node_modules` se for usar Lambda Layer):

<b>Windows (PowerShell):</b>

```powershell
Compress-Archive -Path index.mjs,openai.mjs,utils.mjs,database.mjs,package.json -DestinationPath function.zip -Force
```

<b>macOS/Linux:</b>

```bash
zip -r function.zip index.mjs openai.mjs utils.mjs database.mjs package.json
```
</details>

<details>
<summary><b>2. Crie a função Lambda</b></summary>

1. Acesse o <a href="https://console.aws.amazon.com/lambda/" target="_blank"><b>Console AWS Lambda</b></a>
2. Clique em "Create function" → "Author from scratch":
   - Runtime: Node.js 22.x
   - Nome: <code>recipe-improviser</code>
3. Upload do pacote:
   - Selecione "Upload from" → ".zip file"
   - Escolha o arquivo <code>function.zip</code> criado anteriormente
4. Configurar variáveis de ambiente:
   - <code>OPENAI_API_KEY</code>: sua chave da OpenAI
   - <code>MONGODB_URI</code>: string de conexão do seu MongoDB Atlas ou instância
   - (Opcional) <code>MONGODB_DB</code>: nome do banco (default: <code>recipeimproviser</code>)
   - (Opcional) <code>SKIP_OPENAI</code>: <code>1</code> para modo de teste
</details>



<details>
<summary><b>3. Configure o API Gateway</b></summary>
<summary><b>3. Configure o API Gateway</b></summary>

1. Na função Lambda criada:
   - Clique em <b>Add trigger</b>
2. Selecione <b>API Gateway</b>:
   - <b>Tipo:</b> HTTP API
   - <b>Segurança:</b> Open (para desenvolvimento)
3. <b>Configurar rotas:</b>
   - <code>GET /health</code> (healthcheck)
   - <code>POST /recipe</code> (endpoint principal)
4. Após criação:
   - Anote a <b>URL de invocação</b> (ex: <code>https://[id].execute-api.[region].amazonaws.com</code>)
</details>

<details>
<summary><b>Como usar Lambda Layer para dependências (node_modules)</b></summary>

<b>1. Crie a pasta do layer:</b>

```powershell
mkdir nodejs
Copy-Item -Recurse -Force .\node_modules .\nodejs\
Copy-Item -Force .\package.json .\nodejs\
```

<b>2. Compacte a pasta nodejs:</b>

```powershell
Compress-Archive -Path .\nodejs\* -DestinationPath layer.zip -Force
```

<b>3. No console AWS Lambda:</b>
   - Vá em "Layers" > "Create layer"
   - Faça upload do <code>layer.zip</code>
   - Escolha o runtime Node.js 18.x ou superior
<b>4. Anexe o layer à sua função Lambda</b>
<b>5. No deploy da função, NÃO inclua node_modules</b> (apenas seus arquivos .mjs e package.json)

Assim, sua função Lambda usará as dependências do layer, mantendo o deploy enxuto e rápido!
</details>



---


---

## 💾 Persistência no MongoDB

Cada receita gerada é salva automaticamente na coleção <code>recipes</code> do MongoDB, junto com informações de estilo, dieta, ingredientes e data de criação.

<details>
<summary><b>Exemplo de documento salvo</b></summary>

```json
{
  "title": "Macarrão ao Molho de Tomate e Queijo",
  "servings": 2,
  "time_minutes": 25,
  "ingredients_used": ["200g de macarrão", ...],
  "steps": ["1. Cozinhe o macarrão...", ...],
  "tips": ["Para um toque especial..."],
  "warnings": ["Certifique-se de..."],
  "style": "gourmet",
  "diet": "vegetarian",
  "requested_ingredients": ["tomate", "queijo", "macarrão"],
  "createdAt": "2025-09-10T19:00:00.000Z"
}
```
</details>


---

---

## 📡 Endpoints

### 🩺 Healthcheck

- <b>Método:</b> <code>GET</code>
- <b>Endpoint:</b> <code>/health</code>

<details>
<summary><b>Resposta</b></summary>

```json

## 🧪 Quer testar pelo console da AWS?

Você pode simular requisições diretamente pelo console da AWS Lambda usando os exemplos abaixo:

<details>
<summary><b>Exemplo de evento <code>GET /health</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "GET",
         "path": "/health"
      }
   }
}
```

</details>

<details>
<summary><b>Exemplo de evento <code>POST /recipe</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "POST",
         "path": "/recipe"
      }
   },
   "body": "{\"ingredients\":[\"tomate\",\"queijo\",\"macarrão\"],\"servings\":2,\"style\":\"gourmet\",\"diet\":\"vegetarian\"}",
   "headers": {
      "Content-Type": "application/json"
   }
}
```

</details>

<details>
<summary><b>Testar sem gastar créditos da OpenAI (<code>SKIP_OPENAI</code>)</b></summary>

Se quiser testar sem consumir créditos da OpenAI, basta definir a variável de ambiente <code>SKIP_OPENAI=1</code> na configuração da Lambda. Assim, a função retorna uma receita mockada, sem chamar a API da OpenAI.<br><br>
Ideal para validar integração, deploy e persistência no MongoDB sem custo!


## 🧪 Quer testar pelo console da AWS?

Você pode simular requisições diretamente pelo console da AWS Lambda usando os exemplos abaixo:

<details>
<summary><b>Exemplo de evento <code>GET /health</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "GET",
         "path": "/health"
      }
   }
}
```

</details>

<details>
<summary><b>Exemplo de evento <code>POST /recipe</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "POST",
         "path": "/recipe"
      }
   },
   "body": "{\"ingredients\":[\"tomate\",\"queijo\",\"macarrão\"],\"servings\":2,\"style\":\"gourmet\",\"diet\":\"vegetarian\"}",
   "headers": {
      "Content-Type": "application/json"
   }
}
```

</details>

<details>
<summary><b>Testar sem gastar créditos da OpenAI (<code>SKIP_OPENAI</code>)</b></summary>

Se quiser testar sem consumir créditos da OpenAI, basta definir a variável de ambiente <code>SKIP_OPENAI=1</code> na configuração da Lambda. Assim, a função retorna uma receita mockada, sem chamar a API da OpenAI.<br><br>
Ideal para validar integração, deploy e persistência no MongoDB sem custo!

</details>


## 🧪 Quer testar pelo console da AWS?

## 🧪 Quer testar pelo console da AWS?

Você pode simular requisições diretamente pelo console da AWS Lambda usando os exemplos abaixo:
Você pode simular requisições diretamente pelo console da AWS Lambda usando os exemplos abaixo:

<details>
<summary><b>Exemplo de evento <code>GET /health</code></b></summary>
<summary><b>Exemplo de evento <code>GET /health</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "GET",
         "path": "/health"
      }
   }
   "requestContext": {
      "http": {
         "method": "GET",
         "path": "/health"
      }
   }
}
```


</details>

<details>
<summary><b>Exemplo de evento <code>POST /recipe</code></b></summary>
<summary><b>Exemplo de evento <code>POST /recipe</code></b></summary>

```json
{
   "requestContext": {
      "http": {
         "method": "POST",
         "path": "/recipe"
      }
   },
   "body": "{\"ingredients\":[\"tomate\",\"queijo\",\"macarrão\"],\"servings\":2,\"style\":\"gourmet\",\"diet\":\"vegetarian\"}",
   "headers": {
      "Content-Type": "application/json"
   }
}
```

</details>

<details>
<summary><b>Testar sem gastar créditos da OpenAI (<code>SKIP_OPENAI</code>)</b></summary>

Se quiser testar sem consumir créditos da OpenAI, basta definir a variável de ambiente <code>SKIP_OPENAI=1</code> na configuração da Lambda. Assim, a função retorna uma receita mockada, sem chamar a API da OpenAI.<br><br>
Ideal para validar integração, deploy e persistência no MongoDB sem custo!
   "requestContext": {
      "http": {
         "method": "POST",
         "path": "/recipe"
      }
   },
   "body": "{\"ingredients\":[\"tomate\",\"queijo\",\"macarrão\"],\"servings\":2,\"style\":\"gourmet\",\"diet\":\"vegetarian\"}",
   "headers": {
      "Content-Type": "application/json"
   }
}
```

</details>

<details>
<summary><b>Testar sem gastar créditos da OpenAI (<code>SKIP_OPENAI</code>)</b></summary>

Se quiser testar sem consumir créditos da OpenAI, basta definir a variável de ambiente <code>SKIP_OPENAI=1</code> na configuração da Lambda. Assim, a função retorna uma receita mockada, sem chamar a API da OpenAI.<br><br>
Ideal para validar integração, deploy e persistência no MongoDB sem custo!
</details>

---

<hr/>

## ⚠️ Limitações e Dicas

### Fluxo Síncrono Atual

```mermaid
flowchart TD
   A[Usuário]:::user -->|1. Envia requisição HTTP| B(API Gateway):::gateway
   B -->|2. Roteia| C(Lambda):::lambda
   C -->|3. Processa entrada| D(OpenAI API):::openai
   D -->|4. Gera receita| C
   C -->|5. Salva no MongoDB| E(MongoDB):::mongo
   E -->|6. Confirmação| C
   C -->|7. Formata resposta| B
   B -->|8. Retorna HTTP| A

   classDef user fill:#e3fcec,stroke:#2ecc40,stroke-width:2px,color:#222;
   classDef gateway fill:#eaf6ff,stroke:#3498db,stroke-width:2px,color:#222;
   classDef lambda fill:#fff3cd,stroke:#f1c40f,stroke-width:2px,color:#222;
   classDef openai fill:#fce4ec,stroke:#e84393,stroke-width:2px,color:#222;
   classDef mongo fill:#e8f5e9,stroke:#27ae60,stroke-width:2px,color:#222;

   class A user;
   class B gateway;
   class C lambda;
   class D openai;
   class E mongo;
```

<details>
<summary><b>Por que isso é um problema?</b></summary>

- A função Lambda fica <b>bloqueada</b> esperando a resposta do ChatGPT <b>e do MongoDB</b> (média ~7,5s ou mais).
- Isso aumenta o <b>custo</b> (Lambda cobra por duração) e o <b>tempo de espera</b> do usuário.
- Para grandes volumes, pode causar lentidão e esgotar recursos.

</details>

Para produção, considere:
- Processamento assíncrono (SQS + Lambda Worker)
- Orquestração com Step Functions
- Cache de receitas populares (DynamoDB/S3)
- Streaming de respostas (quando disponível)

> <b>Veja também:</b><br>
> No repositório <a href="https://github.com/nathalia-acordi/recipe-improviser-pipeline/" target="_blank"><b>recipe-improviser-pipeline</b></a> demonstro como resolver esse problema usando uma arquitetura assíncrona, tornando o fluxo mais escalável e eficiente para grandes volumes e respostas demoradas.

<hr>
<div align="center">
   <h3>💬 Ficou com dúvidas, quer trocar ideias ou colaborar?</h3>
   <b>Entre em contato comigo!</b><br><br>
   <a href="mailto:nathaliaccord@gmail.com" target="_blank">
      <img src="https://img.shields.io/badge/E--mail-nathaliaccord@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="E-mail Badge"/>
   </a>
   <a href="https://www.linkedin.com/in/nath%C3%A1lia-acordi-0a564b223/" target="_blank">
      <img src="https://img.shields.io/badge/LinkedIn-Nathália%20Acordi-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge"/>
   </a>
   <br><br>
   Se curtiu o projeto, dê uma estrela! ⭐
</div>
</hr>

---



