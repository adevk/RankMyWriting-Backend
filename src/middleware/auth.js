import jwt from 'jsonwebtoken'
import Repository from '../models/repository'
import createError from 'http-errors'

/**
 * Middleware for protecting routes by authorization.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authorize = async (req, res, next) => {
  const repository = new Repository()

  const JWT_TOKEN_INDEX = 1
  const authorizationHeaderParts = req.headers.authorization.split(' ')
  const jwtSignInToken = authorizationHeaderParts[0] === 'Bearer' && authorizationHeaderParts[JWT_TOKEN_INDEX]

  try {
    // Verify and decode the JWT-token from the client.
    const decodedJwtToken = jwt.verify(jwtSignInToken, process.env.JWT_SECRET)

    const userId = decodedJwtToken.id
    const dbUser = await repository.retrieveUserById(userId)

    // Send authorizedUser to subsequent routes.
    req.authorizedUser = dbUser
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'User is not authenticated.'))
    }
    next(error)
  }
}

export default authorize
