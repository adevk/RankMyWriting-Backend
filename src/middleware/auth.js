import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import createError from 'http-errors'

/**
 * Middleware for protecting routes by authorization.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authorize = async (req, res, next) => {
  const token = req.headers.authorization.startsWith('Bearer') && req.headers.authorization.split(' ')[1]

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id)

    if (!user) {
      next(createError(404, 'There is no user with this id.'))
    } else {
      req.user = user
      next()
    }
  } catch (error) {
    next(createError(404, 'You are not autorized to access this route.'))
  }
}

export default authorize
