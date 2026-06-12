import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

import {
  CreateAccessToken,
  SignUp,
  Login,
  LogOut,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
  CreateRefreshToken,
} from './controller/authcontroller.js'

import { getUserData, updateProfile } from './controller/UserController.js'
import userAuth from './middleware/userAuth.js'

const route = express.Router()

route.post('/signup', SignUp)
route.post('/login', Login)
route.post('/logout', LogOut)

route.post('/send-verify-otp', userAuth, sendVerifyOtp)
route.post('/verify-account', userAuth, verifyEmail)
route.post('/send-reset-otp', sendResetOtp)
route.post('/reset-password', resetPassword)
route.put('/update-profile',userAuth, updateProfile)
route.get('/data', userAuth, getUserData)
route.get('/is-auth', userAuth, isAuthenticated)

route.post('/refresh',(req,res)=>{
  try{
    const token= req.cookies.refreshToken
    if(!token){
      return res.status(401).json({message: "invalid token"})
    }
    const decode = jwt.verify(token, process.env.JWT_Refresh_SECRET)
    const newAccessToken= CreateAccessToken(decode)
    return res.json({AccessToken: newAccessToken})

  }
  catch(error)
  {
  return res.status(403).json({message : 'invalid refresh token'})
  }
})



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
    const accessToken= CreateAccessToken(req.user)
    const refreshToken= CreateRefreshToken(req.user)
    res.cookie('refreshToken', refreshToken,{
      httpOnly: true,
      secure : true,
      sameSite: 'none',
      maxAge:  7 * 24 * 60 * 60 * 1000
    })
    const baseURL = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.CLIENT_URL
    const redirectUrl = `${baseURL}/login?token=${accessToken}`

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.set("Pragma", "no-cache")
    res.set("Expires", "0")
    res.redirect(redirectUrl)
  }
)

export default route