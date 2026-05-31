import jwt from "jsonwebtoken"

const userAuth = async (req, res, next) => {
  let token = req.cookies.token

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, Login Again" })
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
    if (tokenDecode.id) {
      req.userId = tokenDecode.id
    } else {
      return res.json({ success: false, message: "Not Authorized, Login Again" })
    }
    next()
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export default userAuth