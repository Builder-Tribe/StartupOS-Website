import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { seedIfEmpty } from './seed.js'
import { authRouter } from './routes/auth.js'
import { socialRouter } from './routes/social.js'
import { chatsRouter } from './routes/chats.js'
import { hostelsRouter } from './routes/hostels.js'
import { diyRouter } from './routes/diy.js'
import { partnerRouter } from './routes/partner.js'
import { publicTripsRouter } from './routes/publicTrips.js'
import { chatbotRouter } from './routes/chatbot.js'
import { compareRouter } from './routes/compare.js'
import { storiesRouter } from './routes/stories.js'
import { expensesRouter } from './routes/expenses.js'
import { reviewsRouter } from './routes/reviews.js'
import { followsRouter } from './routes/follows.js'
import { adminRouter } from './routes/admin.js'
import { adventuresRouter } from './routes/adventures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Built web app & marketing website live in web/dist and website/dist (server runs from trippy/server/src).
const webDist = path.join(__dirname, '..', '..', 'web', 'dist')
const websiteDist = path.join(__dirname, '..', '..', 'website', 'dist')

export function createApp() {
  seedIfEmpty()

  const app = express()
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174']
  app.use(cors({ origin: allowedOrigins }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'trippy-api' }))
  app.use('/api/auth', authRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/partner', partnerRouter)
  // Mount order matters: routers with public (guest-browsable) endpoints go
  // first — social/chats apply router-wide requireAuth, which would 401 any
  // guest request passing through them on the shared /api prefix.
  app.use('/api', publicTripsRouter)
  app.use('/api', chatbotRouter)
  app.use('/api', compareRouter)
  app.use('/api', storiesRouter)
  app.use('/api', expensesRouter)
  app.use('/api', reviewsRouter)
  app.use('/api', followsRouter)
  app.use('/api', hostelsRouter)
  app.use('/api', diyRouter)
  app.use('/api', adventuresRouter)
  app.use('/api', socialRouter)
  app.use('/api', chatsRouter)

  // Serve marketing website in production at /website and /landing
  if (existsSync(websiteDist)) {
    app.use('/website', express.static(websiteDist))
    app.use('/landing', express.static(websiteDist))
  }

  // Serve the built web app in production. In dev, Vite serves it instead (this dir won't exist).
  if (existsSync(webDist)) {
    app.use(express.static(webDist))
    // SPA fallback: any non-API GET returns index.html so client-side routing works.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/website') || req.path.startsWith('/landing')) return next()
      res.sendFile(path.join(webDist, 'index.html'))
    })
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  })
  return app
}

// Only start listening when run directly (tests import createApp instead).
if (!process.env.TRIPPY_TEST) {
  const PORT = Number(process.env.PORT) || 4000
  createApp().listen(PORT, '0.0.0.0', () => console.log(`Trippy API running on http://localhost:${PORT}`))
}
