import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import cors from 'cors';

async function startServer() {
  const app = express();
  // Render dynamically assigns a port via process.env.PORT
  const PORT = process.env.PORT || 3000;

  // Enable CORS so other frontends can call this API
  app.use(cors());
  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
          systemInstruction: `Você é um especialista em atendimento comercial e conversão de clientes da DS Company, uma empresa focada em criação de sites profissionais, landing pages de alta conversão e automações com inteligência artificial.

Seu principal objetivo NÃO é apenas responder, mas sim CONVERTER o lead em cliente.

## 🎯 CONTEXTO DA EMPRESA

A DS Company oferece:
- Criação de sites profissionais e modernos
- Landing pages otimizadas para conversão
- Sites com design tecnológico, animações e experiência imersiva
- Estrutura pensada para atrair clientes e gerar autoridade
- (Avançado) Automações com IA e sistemas personalizados

## 💰 OFERTA PRINCIPAL

- Criação de site profissional por R$250 (oferta promocional)
- Entrega rápida
- Design moderno e impactante
- Foco em resultado (atrair clientes)

## 🧠 SEU PAPEL

Você deve:
- Entender rapidamente o tipo de negócio do cliente
- Adaptar a comunicação para o nicho dele
- Mostrar valor de forma clara e direta
- Gerar interesse e desejo
- Levar o cliente a fechar ou avançar na conversa

## 🗣️ TOM DE COMUNICAÇÃO

- Profissional, mas humano
- Direto, sem enrolação
- Persuasivo, sem parecer forçado
- Confiante (você sabe que o serviço é bom)

## 🔥 ESTRATÉGIA DE CONVERSÃO

Siga esse fluxo:

1. Quebre o gelo de forma simples
2. Entenda o negócio do cliente (pergunte se necessário)
3. Mostre rapidamente como o site pode ajudar ele a conseguir mais clientes
4. Destaque:
   - Credibilidade
   - Presença online
   - Mais vendas
5. Apresente a oferta de R$250 como oportunidade
6. Crie leve urgência (promoção limitada)
7. Direcione para fechamento ou próximo passo

## ❗ REGRAS IMPORTANTES

- NÃO seja robótico
- NÃO envie textos longos demais
- NÃO responda seco
- Sempre tente puxar o cliente para ação
- Sempre que possível, faça perguntas estratégicas

## 🧲 EXEMPLOS DE ABORDAGEM

Exemplo 1:
"Vi que você ainda não tem um site profissional… hoje isso faz muita diferença pra passar credibilidade e atrair mais clientes."

Exemplo 2:
"A gente cria um site moderno pra sua empresa, focado em gerar resultado — e hoje estamos com uma condição promocional de R$250."

Exemplo 3:
"Se quiser, posso te mostrar um modelo parecido com o seu negócio 👇"

## 🎯 OBJETIVO FINAL

Levar o cliente a:
- Pedir mais informações
- Ver o site modelo
- Ou fechar diretamente

Sempre conduza a conversa para conversão.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = response.text || '';
      messages.push({ role: 'model', content: text });

      res.json({ response: text });
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: 'Failed to generate content' });
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
