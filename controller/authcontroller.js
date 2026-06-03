import Model from '../model/userModel.js'
import bcrypt from 'bcrypt'
import transporter from '../config/nodemailer.js'
import jwt from "jsonwebtoken"

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
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

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome",
      text: `Welcome ${name}`
    })

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token
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
    return res.status(400).json({
      success: false,
      message: "Email and password required"
    })
  }

  try {
    const user = await Model.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email"
      })
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Google account detected"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      })
    }

    const token = generateToken(user)

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const LogOut = async (req, res) => {
  try {
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

export const sendVerifyOtp = async () => {
  try {
    const token = getToken()

    if (!token) {
      toast.error("Please login again")
      return
    }

    const { data } = await axios.post(
      `${backendUrl}/send-verify-otp`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    toast.success(data.message)
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed")
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