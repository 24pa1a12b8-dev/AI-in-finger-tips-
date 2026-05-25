import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createAgent, tool } from 'langchain'
import { z } from 'zod'

const app = express()
const notes = []
const port = Number(process.env.PORT || 8787)

app.use(cors({ origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/] }))
app.use(express.json())

const calculator = tool(
  ({ operation, a, b }) => {
    const operations = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b === 0 ? 'Cannot divide by zero.' : a / b,
      power: a ** b,
    }

    return String(operations[operation])
  },
  {
    name: 'calculator',
    description: 'Perform basic arithmetic with two numbers.',
    schema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power']),
      a: z.number(),
      b: z.number(),
    }),
  },
)

const currentDateTime = tool(
  ({ timeZone }) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone,
    }).format(new Date()),
  {
    name: 'current_datetime',
    description: 'Get the current date and time. Use this for questions about now or today.',
    schema: z.object({
      timeZone: z.string().default('Asia/Kolkata'),
    }),
  },
)

const rememberNote = tool(
  ({ note }) => {
    notes.push({ note, createdAt: new Date().toISOString() })
    return `Saved note ${notes.length}.`
  },
  {
    name: 'remember_note',
    description: 'Save a short note for this running server session.',
    schema: z.object({
      note: z.string().min(1),
    }),
  },
)

const recallNotes = tool(
  () => {
    if (notes.length === 0) {
      return 'No notes saved yet.'
    }

    return notes.map((item, index) => `${index + 1}. ${item.note}`).join('\n')
  },
  {
    name: 'recall_notes',
    description: 'Read all notes saved during this running server session.',
    schema: z.object({}),
  },
)

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash',
  temperature: 0.4,
})

const agent = createAgent({
  model: llm,
  tools: [calculator, currentDateTime, rememberNote, recallNotes],
  prompt:
    'You are a concise, helpful AI agent inside a Gemini-like mobile chat UI. Use tools when they help answer accurately. Mention tool results naturally, without exposing internal steps.',
})

function getTextFromContent(content) {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }

        if (part && typeof part === 'object' && 'text' in part) {
          return part.text
        }

        return ''
      })
      .filter(Boolean)
      .join('\n')
  }

  return ''
}

app.get('/api/tools', (_request, response) => {
  response.json({
    tools: [
      { name: 'calculator', description: 'Arithmetic with add, subtract, multiply, divide, power.' },
      { name: 'current_datetime', description: 'Current date and time.' },
      { name: 'remember_note', description: 'Save a temporary note.' },
      { name: 'recall_notes', description: 'Read temporary notes.' },
    ],
  })
})

app.post('/api/chat', async (request, response) => {
  if (!process.env.GEMINI_API_KEY) {
    response.status(500).json({ error: 'Missing GEMINI_API_KEY in .env.' })
    return
  }

  const incomingMessages = Array.isArray(request.body?.messages) ? request.body.messages : []
  const messages = incomingMessages
    .filter((message) => message?.role && message?.text)
    .map((message) => ({
      role: message.role === 'model' ? 'assistant' : 'user',
      content: String(message.text),
    }))

  try {
    const result = await agent.invoke({ messages })
    const lastMessage = result.messages.at(-1)
    const reply = getTextFromContent(lastMessage?.content).trim()

    response.json({
      reply: reply || 'I finished, but did not receive a text response.',
      toolCount: result.messages.filter((message) => message._getType?.() === 'tool').length,
    })
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Agent request failed.',
    })
  }
})

app.listen(port, () => {
  console.log(`LangChain agent server running at http://127.0.0.1:${port}`)
})
