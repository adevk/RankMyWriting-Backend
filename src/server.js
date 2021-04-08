/**
 * The starting point of the application.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import express from 'express'
import logger from 'morgan'
// import { dirname, join } from 'path'
// import { fileURLToPath } from 'url'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import helmet from 'helmet'

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
  // const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // const baseURL = process.env.BASE_URL || '/'

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'font-src': ["'self'"],
        'style-src': ["'self'"]
      }
    }
  }))

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // app.set('views', join(directoryFullName, 'views'))

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Parse json requests.
  app.use(express.json());

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
      return res.status(404)
    }

    // 403 Forbidden.
    if (err.status === 403) {
      return res.status(404)
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
