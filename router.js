import express from 'express'
import { SignUp,Login,LogOut,sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword,isAuthenticated } from './controller/authcontroller.js'
import { getUserData} from './controller/UserController.js'
import passport from "passport"
import userAuth from './middleware/userAuth.js'
const route=express.Router();

route.post('/signup', SignUp)
route.post('/login',Login)
route.post('/logout',LogOut)
route.post('/send-verify-otp',userAuth,sendVerifyOtp);
route.post('/verify-account',userAuth, verifyEmail);
route.post('/send-reset-otp', sendResetOtp);
route.post('/reset-password', resetPassword)
route.get('/data',userAuth, getUserData)
route.get("/is-auth", userAuth, isAuthenticated)
route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

import jwt from "jsonwebtoken"

route.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://auth-frontend-9vkd.vercel.app/login",
    session: false
  }),
  (req, res) => {

    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none"
    })

    
    res.redirect("https://auth-frontend-9vkd.vercel.app/")
  }
)
export default route;