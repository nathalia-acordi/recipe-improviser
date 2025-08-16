# 🍳 Recipe Improviser – API Serverless com ChatGPT
Uma **API serverless** construída com **AWS Lambda + API Gateway**, capaz de gerar receitas culinárias com base nos ingredientes informados pelo usuário.  
A geração das receitas utiliza a **API do OpenAI (ChatGPT)** com diferentes estilos e restrições alimentares.  

Projeto desenvolvido como exemplo prático de integração entre **Serverless + IA**.

---

## 📑 Sumário

1. [✨ Funcionalidades](#-funcionalidades)  
2. [🛠️ Pré-requisitos](#️-pré-requisitos)  
3. [🚀 Deploy na AWS Lambda](#-deploy-na-aws-lambda)  
4. [📡 Endpoints da API](#-endpoints-da-api)  
   - [Healthcheck](#healthcheck)  
   - [Gerar Receita](#gerar-receita)  
5. [⚠️ Limitação Arquitetural](#️-limitação-arquitetural) 

---

## ✨ Funcionalidades

- ✅ Geração de receitas a partir de ingredientes informados  
- ✅ Suporte a **estilos** (simple, funny, gourmet, chaotic)  
- ✅ Suporte a **restrições alimentares** (vegan, vegetarian, gluten-free, lactose-free, low-cost)  
- ✅ Endpoint de saúde (`GET /health`)  
- ✅ Modo offline para testes (ignora chamada à OpenAI)  
- ✅ Empacotamento simples em um único Lambda  

---

## 🛠️ Pré-requisitos

Antes de começar, você precisa ter:  

- Conta na **AWS** (Lambda + API Gateway)  
- **Node.js 18+** instalado  
- **AWS CLI** configurado (`aws configure`)  
- Chave da **API OpenAI** configurada como variável de ambiente:  

---

## 🚀 Deploy na AWS Lambda
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
   - 🔧 **Runtime**: Node.js 18.x
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
  "ingredients": ["tomato", "cheese", "pasta"],
  "servings": 2,
  "style": "gourmet",
  "diet": "vegetarian"
}
```

**Resposta** 
```json
{
  "title": "Pasta alla Chef",
  "servings": 2,
  "time_minutes": 25,
  "ingredients_used": ["tomato", "cheese", "pasta"],
  "steps": ["Boil pasta", "Prepare sauce", "Mix and serve"],
  "tips": ["Use fresh cheese for better taste"],
  "warnings": []
}
```



