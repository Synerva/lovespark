import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

function localAiApiPlugin(openAIKey?: string): PluginOption {
  return {
    name: 'local-ai-api',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'Method not allowed. Use POST.' } }))
          return
        }

        const apiKey = openAIKey
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'OPENAI_API_KEY is missing in local environment.' } }))
          return
        }

        let rawBody = ''
        req.on('data', (chunk) => {
          rawBody += chunk
        })

        req.on('end', async () => {
          let body: { messages?: unknown; model?: unknown } = {}
          try {
            body = rawBody ? JSON.parse(rawBody) : {}
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message: 'Invalid JSON body.' } }))
            return
          }

          const messages = Array.isArray(body.messages) ? body.messages : null
          const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_OPENAI_MODEL

          if (!messages || messages.length === 0) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message: 'Invalid request body. `messages` must be a non-empty array.' } }))
            return
          }

          try {
            const openAIResponse = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
              }),
            })

            const payload = await openAIResponse.json().catch(() => null)

            if (!openAIResponse.ok) {
              const providerMessage = payload?.error?.message || `OpenAI request failed with status ${openAIResponse.status}.`
              res.statusCode = openAIResponse.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: { message: providerMessage } }))
              return
            }

            const content = payload?.choices?.[0]?.message?.content?.trim()
            if (!content) {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: { message: 'OpenAI returned an empty response.' } }))
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ content }))
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown server error while calling OpenAI.'
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: { message } }))
          }
        })

        req.on('error', () => {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'Failed to read request body.' } }))
        })

      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      localAiApiPlugin(env.OPENAI_API_KEY),
      // DO NOT REMOVE
      createIconImportProxy() as PluginOption,
      sparkPlugin({ port: 5173 }) as PluginOption,
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  }
});
