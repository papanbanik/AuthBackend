import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import {
  SignUp,
  Login,
  LogOut,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  isAuthenticated
} from './controller/authcontroller.js'

import { getUserData } from './controller/UserController.js'
import userAuth from './middleware/userAuth.js'

const route = express.Router()

route.post('/signup', SignUp)
route.post('/login', Login)
route.post('/logout', LogOut)

route.post('/send-verify-otp', userAuth, sendVerifyOtp)
route.post('/verify-account', userAuth, verifyEmail)
route.post('/send-reset-otp', sendResetOtp)
route.post('/reset-password', resetPassword)

route.get('/data', userAuth, getUserData)
route.get('/is-auth', userAuth, isAuthenticated)

// Google Login
route.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
)

// Google Callback
route.get(
  
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.NODE_ENV==="production" ? process.env.PRODUCTION_URL : process.env.CLIENT_URL}/login`,
    session: false
  }),
  (req, res) => {

    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
  const baseURL = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.CLIENT_URL
    const redirectUrl = `${baseURL}/login?token=${token}`

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.set("Pragma", "no-cache")
    res.set("Expires", "0")
    res.redirect(redirectUrl)
  }
)

export default route