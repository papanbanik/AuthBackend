import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import route from './router.js'
import connectDB from './config/mongodb.js'
import './config/passport.js'
const app = express()

// Validate required env vars
const requiredEnvVars = ['JWT_Access_SECRET', 'JWT_Refresh_SECRET', 'MONGODB_URI']
const missingVars = requiredEnvVars.filter(v => !process.env[v])
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars)
  console.error('Please set these in your .env file or Vercel environment variables')
}

const whitelist = [
  'http://localhost:3000',
  'https://auth-frontend-9vkd.vercel.app',
  process.env.CLIENT_URL,
  process.env.PRODUCTION_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    // Don't throw error on CORS rejection, just pass false
    callback(null, false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}))

app.use(express.json())
app.use(cookieParser())

app.use(passport.initialize())

// Only connect to DB if URI is provided
if (process.env.MONGODB_URI) {
  connectDB()
} else {
  console.warn('⚠️ MONGODB_URI not set, skipping database connection')
}

app.get('/', (req, res) => {
  res.send('API Working')
})

app.use('/', route)

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
  })
}

export default app