import jwt from "jsonwebtoken"

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Login Again"
      })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_Access_SECRET)

    req.userId = decoded.id

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token"
    })
  }
}

export default userAuth