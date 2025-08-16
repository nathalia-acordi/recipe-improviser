# Recipe Improviser – API Serverless com ChatGPT
Uma **API serverless** construída com **AWS Lambda + API Gateway**, capaz de gerar receitas culinárias com base nos ingredientes informados pelo usuário.  
A geração das receitas utiliza a **API do OpenAI (ChatGPT)** com diferentes estilos e restrições alimentares.  

Projeto desenvolvido como exemplo prático de integração entre **Serverless + IA**.

---

## 📑 Sumário

1. [Funcionalidades](#-funcionalidades)  
2. [Pré-requisitos](#️-pré-requisitos)  
3. [Deploy na AWS Lambda](#-deploy-na-aws-lambda)  
4. [Endpoints da API](#-endpoints-da-api)  
   - [Healthcheck](#healthcheck)  
   - [Gerar Receita](#gerar-receita)  
5. [Limitação Arquitetural](#️-limitação-arquitetural) 

---

## Funcionalidades

- ✅ Geração de receitas a partir de ingredientes informados  
- ✅ Suporte a **estilos** (simple, funny, gourmet, chaotic)  
- ✅ Suporte a **restrições alimentares** (vegan, vegetarian, gluten-free, lactose-free, low-cost)  
- ✅ Endpoint de saúde (`GET /health`)  
- ✅ Modo offline para testes (ignora chamada à OpenAI)  
- ✅ Empacotamento simples em um único Lambda  

---

## Pré-requisitos

Antes de começar, você precisa ter:  

- Conta na **AWS** (Lambda + API Gateway)  
- **Node.js 18+** instalado  
- **AWS CLI** configurado (`aws configure`)  
- Chave da **API OpenAI** configurada como variável de ambiente:  

---

## Deploy na AWS Lambda
1. [Empacotar código](#1-empacotar-para-deploy)
2. [Criar função Lambda](#2-criar-função-lambda)
3. [Configurar API Gateway](#3-configurar-api-gateway)

---

### 1. Empacotar para deploy

### macOS/Linux
```bash
zip -r function.zip index.mjs package.json
```

### Windows (PowerShell)
```bash
Compress-Archive -Path index.mjs,package.json -DestinationPath function.zip -Force
```

--
## 2. Criar função Lambda

1. **Acesse o [Console AWS Lambda](https://console.aws.amazon.com/lambda/)**
2. **Create function** → "Author from scratch":
   - 🔧 **Runtime**: Node.js 22.x
   - 📛 **Nome**: `recipe-improviser`
3. **Upload do pacote**:
   - Selecione "Upload from" → ".zip file"
   - Escolha o arquivo `function.zip` criado anteriormente
4. **Configurar variáveis de ambiente**:
   - `OPENAI_API_KEY`: sua chave da OpenAI
   - (Opcional) `SKIP_OPENAI`: `1` para modo de teste

## 3. Configurar API Gateway

1. Na função Lambda criada:
   - Clique em **Add trigger**
2. Selecione **API Gateway**:
   - **Tipo**: HTTP API
   - **Segurança**: Open (para desenvolvimento)
3. **Configurar rotas**:
   - `GET /health` (healthcheck)
   - `POST /recipe` (endpoint principal)
4. Após criação:
   - Anote a **URL de invocação** (ex: `https://[id].execute-api.[region].amazonaws.com`)

---
## 📡 Endpoints da API

### Healthcheck

**Método:** `GET`  
**Endpoint:** `/health`  
**Resposta:** 
```json
{
  "ok": true
}
```

### Gerar Receita

**Método:** `POST`  
**Endpoint:** `/recipe`    
**Body de exemplo** 
```json
{
  "ingredients": ["tomate", "queijo", "macarrão"],
  "servings": 2,
  "style": "gourmet",
  "diet": "vegetarian"
}
```

**Resposta** 
```json
{
    "title": "Macarrão ao Molho de Tomate e Queijo",
    "servings": 2,
    "time_minutes": 25,
    "ingredients_used": [
        "200g de macarrão",
        "2 tomates maduros",
        "100g de queijo (pode ser muçarela ou queijo parmesão)"
    ],
    "steps": [
        "1. Cozinhe o macarrão em água salgada fervente até ficar al dente, seguindo as instruções da embalagem.",
        "2. Enquanto o macarrão cozinha, lave os tomates e corte-os em cubos pequenos.",
        "3. Em uma panela, adicione um fio de azeite e refogue os tomates em fogo médio até que comecem a desmanchar, cerca de 5 minutos.",
        "4. Adicione o macarrão cozido à panela com os tomates e misture bem. Se necessário, acrescente um pouco da água do cozimento para soltar o molho.",
        "5. Rale o queijo e adicione à mistura, mexendo até derreter e incorporar ao molho.",
        "6. Tempere com sal e pimenta a gosto e sirva quente."
    ],
    "tips": [
        "Para um toque especial, adicione manjericão fresco ou orégano ao molho.",
        "Se preferir um molho mais cremoso, adicione um pouco de creme de leite ou uma colher de sopa de manteiga no final."
    ],
    "warnings": [
        "Certifique-se de cozinhar o macarrão até que esteja completamente cozido.",
        "Verifique se você não tem alergia a algum dos ingredientes, especialmente ao queijo."
    ]
}
```
---
## Limitação Arquitetural

Atualmente, a API segue um fluxo **síncrono**:

| #  | Componente      | Ação                         |
|----|----------------|-------------------------------|
| 1  | Cliente        | Envia requisição HTTP         |
| 2  | API Gateway    | Roteia para Lambda            |
| 3  | Lambda         | Processa entrada              |
| 4  | ChatGPT API    | Gera conteúdo (7,5s)          |
| 5  | Lambda         | Formata resposta              |
| 6  | API Gateway    | Retorna HTTP                  |
| 7  | Cliente        | Recebe resposta               |


- A Lambda fica bloqueada aguardando a resposta do ChatGPT.  
- Tempo médio de resposta: ~7,5 segundos por requisição.  
- Isso aumenta tanto o custo (Lambda cobra por duração) quanto o tempo de espera do usuário.  

### Para reduzir custos e melhorar a experiência:
- Adotar processamento **assíncrono** (ex.: SQS + Lambda Worker).  
- Usar **Step Functions** para orquestrar fluxos mais longos.  
- Implementar **cache** em DynamoDB ou S3 para receitas populares.  
- Explorar **respostas em streaming** quando disponível no API Gateway.  



