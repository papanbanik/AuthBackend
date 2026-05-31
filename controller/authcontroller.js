import Model from '../model/userModel.js'
import bcrypt from 'bcrypt'
import transporter from '../config/nodemailer.js'
import jwt from "jsonwebtoken"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000
}

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export const SignUp = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    })
  }

  try {
    const existingUser = await Model.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await Model.create({
      name,
      email,
      password: hashedPassword
    })

    const token = generateToken(user)

    res.cookie("token", token, COOKIE_OPTIONS)

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome",
      text: `Welcome ${name}`
    })

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const Login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password required"
    })
  }

  try {
    const user = await Model.findOne({ email })

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email"
      })
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "Google account detected"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password"
      })
    }

    const token = generateToken(user)

    res.cookie("token", token, COOKIE_OPTIONS)

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const LogOut = async (req, res) => {
  try {
    res.clearCookie("token", COOKIE_OPTIONS)

    return res.json({
      success: true,
      message: "Logged out"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await Model.findById(req.userId)

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Already verified" })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = otp
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save()

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    })

    return res.json({
      success: true,
      message: "OTP sent"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const verifyEmail = async (req, res) => {
  const { otp } = req.body

  if (!otp) {
    return res.json({
      success: false,
      message: "OTP required"
    })
  }

  try {
    const user = await Model.findById(req.userId)

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" })
    }

    user.isAccountVerified = true
    user.verifyOtp = ""
    user.verifyOtpExpireAt = 0

    await user.save()

    return res.json({
      success: true,
      message: "Email verified"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const sendResetOtp = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.json({
      success: false,
      message: "Email required"
    })
  }

  try {
    const user = await Model.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

    await user.save()

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset OTP",
      text: `Your OTP is ${otp}`
    })

    return res.json({
      success: true,
      message: "OTP sent"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "All fields required"
    })
  }

  try {
    const user = await Model.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    user.resetOtp = ""
    user.resetOtpExpireAt = 0

    await user.save()

    return res.json({
      success: true,
      message: "Password reset successful"
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const isAuthenticated = async (req, res) => {
  try {
    const user = await Model.findById(req.userId)

    if (!user) {
      return res.json({ success: false })
    }

    return res.json({
      success: true,
      user
    })

  } catch {
    return res.json({ success: false })
  }
}