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

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// 🔥 session MUST come before passport
app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

connectDB()

app.get('/', (req,res)=>{
  res.send('API Working')
})

app.use('/', route)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`)
})