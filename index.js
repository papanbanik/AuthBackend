import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import route from './router.js'
import connectDB from './config/mongodb.js'
import './config/passport.js'
const app = express()
const whitelist = [
  'http://localhost:3000',
  'https://auth-frontend-9vkd.vercel.app',
  process.env.CLIENT_URL,
  process.env.PRODUCTION_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Ensure OPTIONS preflight requests are handled for all routes
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

app.use(passport.initialize())
connectDB()

app.get('/', (req, res) => {
  res.send('API Working')
})

app.use('/', route)

const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
  })
}

export default app