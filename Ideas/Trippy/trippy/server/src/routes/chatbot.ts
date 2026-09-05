import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import {
  parseTravelQuery, rankTrips, composeReply, buildEnhancedReply, buildChatbotPrompt,
  TravelIntent, AiTripReply,
} from '../lib/discovery.js'

export const chatbotRouter = Router()

// AI Trip Discovery chat endpoint (PRD 2.1).
// Stateless on the server — the client echoes back the intent from the previous
// turn so parseTravelQuery can carry context (destination, budget, etc.) forward.
chatbotRouter.post('/discover/chat', async (req, res) => {
  const { message, context } = req.body as { message: unknown; context?: Partial<TravelIntent> }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  const intent = parseTravelQuery(message.slice(0, 500), context)
  const results = rankTrips(intent)

  let aiReply: AiTripReply | null = null

  // Try Claude for rich structured recommendations
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic()
      const msg = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2500,
        messages: [{ role: 'user', content: buildChatbotPrompt(message, intent, results) }],
      })
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim()
      // Extract JSON — Claude may wrap in markdown code fences
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AiTripReply
        // Attach matched platform trips to options
        if (parsed.options) {
          parsed.options = parsed.options.map((opt: any) => {
            if (opt.matchedTripIndex != null && results[opt.matchedTripIndex]) {
              opt.matchedTrip = results[opt.matchedTripIndex]
            }
            delete opt.matchedTripIndex
            return opt
          })
        }
        aiReply = parsed
      }
    } catch (err: any) {
      console.error('[chatbot] Claude error:', err?.message || err)
    }
  }

  // Fallback: enhanced rule-based structured reply
  if (!aiReply) {
    aiReply = buildEnhancedReply(intent, results)
  }

  const reply = aiReply.summary
  res.json({ reply, aiReply, results, intent })
})
