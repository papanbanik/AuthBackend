import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'

import route from './router.js'
import connectDB from './config/mongodb.js'
import './config/passport.js'

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://auth-frontend-9vkd.vercel.app'
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(cookieParser())

// Passport without session
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