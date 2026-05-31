import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from "express-session"
import passport from "passport"

import route from './router.js'
import connectDB from './config/mongodb.js'
import "./config/passport.js"

const app = express()

app.use(cors({
  origin: [
    'https://auth-frontend-9vkd.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.use(express.json())
app.use(cookieParser())

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none'
  }
}))

app.use(passport.initialize())
app.use(passport.session())

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