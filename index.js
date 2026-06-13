import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import route from './router.js'
import connectDB from './config/mongodb.js'
import './config/passport.js'

const app = express()

/* ---------------- ENV CHECK ---------------- */
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI'
]

const missingVars = requiredEnvVars.filter(
  (key) => !process.env[key]
)

if (missingVars.length > 0) {
  console.error('❌ Missing ENV:', missingVars)
}

/* ---------------- DB CONNECT ---------------- */
if (process.env.MONGODB_URI) {
  connectDB()
}

/* ---------------- MIDDLEWARE ---------------- */

/* CORS (IMPORTANT FIX) */
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.PRODUCTION_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// IMPORTANT: handle preflight requests
app.options(/.*/, cors())
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

/* ---------------- ROUTES ---------------- */
app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

app.use('/', route)

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err)

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 3001

// Only run locally (Vercel uses serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

export default app