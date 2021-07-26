/**
 * Middleware for handling the errors to be sent to the client.
 *
 * @param {object} err - Express error object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const handleErrors = function (err, req, res, next) {
  // 404 Not Found.
  if (err.status === 404) {
    res.status(404).send({ message: (err.message || '404 Not Found.') })
  }

  // 403 Forbidden.
  if (err.status === 403) {
    // Return a 404, hiding the fact that the resource exists.
    res.status(404).send({ message: (err.message || '404 Not Found.') })
  }

  // 400 Bad request (ex: unallowed registration input)
  if (err.status === 400) {
    const message = err.name === 'ValidationError' ? _extractValidationErrorMessage(err) : '400 Bad Request.'
    res.status(400).send({ message: message })
  }

  // 401 Unauthorized (ex: not authenticated)
  if (err.status === 401) {
    res.status(401).send({ message: (err.message || '401 Unauthorized.') })
  }

  // 409 Conflict (ex: username already taken)
  if (err.status === 409) {
    // Message if duplicate username.
    const message = (err.keyValue && err.keyValue.username) ? `The username ${err.keyValue.username} is already taken.` : '409 Conflict.'
    res.status(409).send({ message: message })
  }

  // 500 Internal Server Error (in production, all other errors send this response).
  if (req.app.get('env') !== 'development') {
    res.status(500).send(err)
  } else {
    res.status(500).send(err.stack)
  }
}

/**
 * Helper function for extracting a combined error message made up of the different validation errors.
 *
 * @param {object} err - Express error object.
 * @returns {string} The combined error message.
 */
const _extractValidationErrorMessage = (err) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const errorMessage = errors.join(' ')
  return errorMessage
}

export default handleErrors
