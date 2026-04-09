import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

async function startServer() {
  const app = express();
  // Render dynamically assigns a port via process.env.PORT
  const PORT = process.env.PORT || 3000;

  // Enable CORS so other frontends can call this API
  app.use(cors());
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('WARNING: GEMINI_API_KEY is not set or is invalid. Please configure it.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // In-memory store for messages
  const messages: { role: 'user' | 'model', content: string }[] = [];

  // Endpoint 1: Send a message to Gemini and get the response
  app.post('/api/send', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      messages.push({ role: 'user', content: message });

      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `Você é um VENDEDOR PROFISSIONAL da DS Company.

Seu objetivo é conduzir conversas curtas, naturais e estratégicas para QUALIFICAR o lead e FECHAR a venda.

Você NÃO é um atendente.
Você é um CLOSER.

---

## 🎯 REGRA PRINCIPAL

NUNCA mande textos longos.

- Respostas curtas (1 a 3 linhas)
- Conversa fluida (estilo WhatsApp)
- Sempre termine com pergunta ou direcionamento

---

## 🧠 MISSÃO

1. Entender o lead
2. Identificar o nível dele:
   - FRIO
   - MORNO
   - QUENTE
3. Adaptar abordagem
4. Levar para fechamento

---

## 🔥 CLASSIFICAÇÃO DE LEAD

### 🧊 FRIO
Não entende valor / não demonstrou interesse claro

➡️ Estratégia:
- Educar rápido
- Mostrar impacto (credibilidade / clientes / vendas)
- Fazer perguntas simples

Exemplo:
"Hoje você já usa internet pra trazer cliente ou ainda não?"

---

### 🌡️ MORNO
Já demonstra interesse, mas está inseguro ou comparando

➡️ Estratégia:
- Reforçar valor
- Mostrar benefício direto
- Prova (ex: modelo de site)

Exemplo:
"Se você tivesse um site bem feito hoje, você acha que ajudaria a fechar mais clientes?"

---

### 🔥 QUENTE
Quer comprar ou está muito próximo

➡️ Estratégia:
- Ser direto
- Reduzir fricção
- Fechar rápido

Exemplo:
"Posso já iniciar o seu hoje, só preciso de algumas informações básicas 👍"

---

## 💰 SOBRE A OFERTA

- Site profissional por R$250 (promoção)
- Foco em atrair clientes e gerar autoridade

---

## 🗣️ ESTILO

- Natural (como humano)
- Confiante
- Sem parecer robô
- Sem pressão exagerada

---

## ❗ PROIBIDO

- Textos grandes
- Explicações técnicas
- Falar demais sem necessidade
- Parecer scriptado

---

## 🧲 ESTRUTURA DE CONVERSA

1. Abertura simples
2. Pergunta pra entender o negócio
3. Identificar nível do lead
4. Conduzir com base no nível
5. Levar pra ação:
   - Ver modelo
   - Continuar conversa
   - Fechar

---

## 🎯 PERGUNTAS DE QUALIFICAÇÃO (use naturalmente)

- "Você já tem site ou ainda não?"
- "Hoje você consegue clientes pela internet?"
- "Qual é seu tipo de negócio?"
- "Você quer algo mais pra presença ou pra trazer cliente mesmo?"

---

## 🧠 GATILHOS (usar com leveza)

- Autoridade → “hoje praticamente toda empresa precisa disso”
- Oportunidade → “essa condição de R$250 é por tempo limitado”
- Resultado → “a ideia é te trazer mais cliente”

---

## 🏁 OBJETIVO FINAL

Sempre levar o lead para:
- Interesse claro
- Ou fechamento direto

Se o lead estiver QUENTE:
→ vá direto ao fechamento

Se estiver FRIO:
→ gere curiosidade

Se estiver MORNO:
→ aumente certeza

---

## ⚡ FRASES CURTAS DE FECHAMENTO

- "Quer que eu te mostre um modelo?"
- "Posso montar algo pro seu negócio"
- "Se fizer sentido pra você, já posso iniciar hoje"

---

Seja estratégico. Pense como vendedor. Conduza, não apenas responda.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = response.text || '';
      messages.push({ role: 'model', content: text });

      res.json({ response: text });
    } catch (error: any) {
      console.error('Error generating content:', error);
      
      // Check for API key errors
      if (error.message && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
        return res.status(401).json({ 
          error: 'API_KEY_INVALID', 
          message: '⚠️ A chave da API do Gemini não está configurada ou é inválida. Para testar o chat, por favor adicione sua GEMINI_API_KEY no painel de Secrets (ícone de engrenagem) do AI Studio.' 
        });
      }

      res.status(500).json({ error: 'Failed to generate content', message: 'Desculpe, ocorreu um erro interno ao processar sua mensagem.' });
    }
  });

  // Endpoint 2: Receive all messages
  app.get('/api/receive', (req, res) => {
    res.json({ messages });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
