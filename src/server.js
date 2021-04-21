/**
 * The starting point of the application.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import express from 'express'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import helmet from 'helmet'
import cors from 'cors'
import session from 'express-session'

/**
 * The main function of the application.
 */
const main = async () => {
  try {
    await connectDB()
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
    return
  }

  const app = express()

  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  //       'default-src': ["'self'"],
  //       'script-src': ["'self'"],
  //       'font-src': ["'self'"],
  //       'style-src': ["'self'"]
  //     }
  //   }
  // }))

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // app.set('views', join(directoryFullName, 'views'))

  // Parse json requests.
  app.use(express.json())

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: true }))

  // TODO: Set session store for production environment.

  // Setup and use session middleware (https://github.com/expressjs/session)
  const sessionOptions = {
    name: process.env.SESSION_NAME, // Don't use default session cookie name.
    secret: process.env.SESSION_SECRET, // Change it!!! The secret is used to hash the session with HMAC.
    resave: false, // Resave even if a request is not changing the session.
    saveUninitialized: true, // Don't save a created but not modified session.
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'lax'
    }
  }

  app.use(session(sessionOptions))

  // TODO: Set specific cors allowed origin for production environment.
  app.use(cors())

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionOptions.cookie.secure = true // serve secure cookies
  }

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    // 404 Not Found.
    if (err.status === 404) {
      return res.status(404).send({ message: (err.message || '404 Not Found.') })
    }

    // 403 Forbidden.
    if (err.status === 403) {
      // Return a 404, hiding the fact that the resource exists.
      return res.status(404).send({ message: (err.message || '404 Not Found.') })
    }

    // 400 Bad request (ex: unallowed registration input)
    if (err.status === 400) {
      return res.status(400).send({ message: (err.message || '400 Bad Request.') })
    }

    // 401 Unauthorized (ex: not authenticated)
    if (err.status === 401) {
      return res.status(401).send({ message: (err.message || '401 Unauthorized.') })
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') {
      return res.status(500).send(err)
    } else {
      return res.status(500).send(err.stack)
    }
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
}

main()
