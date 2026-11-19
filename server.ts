import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_MODELS = new Set(['gemini-4-hydrogen', 'gemini-3.1-flash-lite']);

interface IncomingMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message?: string;
  history?: IncomingMessage[];
  model?: string;
  roleId?: 'discourse-guide' | 'quick-study' | 'web-research';
  useSearchGrounding?: boolean;
  archiveContext?: string;
}

function getSystemInstruction(
  roleId: ChatRequestBody['roleId'],
  archiveContext?: string,
): string {
  const baseCatalog = archiveContext
    ? `\n\nCurrent Vipassana Bhavana Archive Context:\n${archiveContext}`
    : '';

  if (roleId === 'quick-study') {
    return (
      'You are the Quick Pāli Glossary & Study Planner for Vipassana Bhavana (Dhamma Page). ' +
      'Provide concise, accurate definitions of Pāli Theravāda terms (with diacritics), brief explanations of meditation concepts, ' +
      'and practical study session recommendations using the discourse reading times provided in the archive context. ' +
      'Keep answers crisp, structured, and easy to scan in 2–4 short paragraphs or bullet points.' +
      baseCatalog
    );
  }

  if (roleId === 'web-research') {
    return (
      'You are the Tipiṭaka & Sayadaw Lineage Research Assistant for Vipassana Bhavana (Dhamma Page). ' +
      'Use Google Search grounding to find accurate, up-to-date references on Theravāda Sayadaw teachings, Pāli Canon sutta citations, ' +
      'monastery schedules, and Buddhist textual translations. Always summarize clearly in neutral, respectful, scholarly prose.' +
      baseCatalog
    );
  }

  return (
    'You are the Sayadaw Discourse Guide for Vipassana Bhavana (Dhamma Page). ' +
    'Help practitioners and students understand Theravāda Buddhist discourses from Sayadaws such as Ven. Dr. Nandamālābhivaṃsa, ' +
    'Ven. Mogok Sayadaw, Ven. Mahāsi Sayadaw, Ven. Pa-Auk Sayadaw, and Ven. Bhikkhu Uttamo. ' +
    'Explain Abhidhamma, Satipaṭṭhāna meditation, and Pāli terminology clearly with accurate textual references, ' +
    'while remaining warm, grounded, and faithful to Theravāda scholarship.' +
    baseCatalog
  );
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check your environment configuration in Settings > Secrets.',
        });
        return;
      }

      const body = (req.body || {}) as ChatRequestBody;
      const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
      if (!userMessage) {
        res.status(400).json({ error: 'Message text is required.' });
        return;
      }

      const requestedModel = body.model && ALLOWED_MODELS.has(body.model)
        ? body.model
        : 'gemini-4-hydrogen';

      const useSearch = Boolean(body.useSearchGrounding) || body.roleId === 'web-research';
      const activeModel = useSearch ? 'gemini-4-hydrogen' : requestedModel;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const history: Content[] = Array.isArray(body.history)
        ? body.history
            .filter(
              (m) =>
                m &&
                (m.role === 'user' || m.role === 'model') &&
                typeof m.text === 'string' &&
                m.text.trim().length > 0,
            )
            .slice(-20)
            .map((m) => ({
              role: m.role,
              parts: [{ text: m.text }],
            }))
        : [];

      const systemInstruction = getSystemInstruction(body.roleId, body.archiveContext);

      const chat = ai.chats.create({
        model: activeModel,
        history,
        config: {
          systemInstruction,
          ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });

      const response = await chat.sendMessage({ message: userMessage });
      const text = response.text ?? '';

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const seenUris = new Set<string>();
      const sources: { title: string; uri: string }[] = [];

      for (const chunk of rawChunks) {
        const web = chunk.web;
        if (web?.uri && !seenUris.has(web.uri)) {
          seenUris.add(web.uri);
          sources.push({
            uri: web.uri,
            title: web.title || web.uri,
          });
        }
      }

      const webSearchQueries =
        response.candidates?.[0]?.groundingMetadata?.webSearchQueries ?? [];

      res.json({
        text,
        model: activeModel,
        sources,
        webSearchQueries,
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const status = typeof errorObj?.status === 'number' ? errorObj.status : 500;
      const message =
        errorObj?.message || 'Unable to generate a response from the Gemini API right now.';

      if (status === 403 || status === 400) {
        res.status(status).json({
          error: `Gemini API authentication or request error (${status}). Please verify your API key in Settings > Secrets. Details: ${message}`,
        });
        return;
      }

      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vipassana Bhavana server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
