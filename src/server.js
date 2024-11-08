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
import cors from 'cors'
import helmet from 'helmet'
import errorHandler from './middleware/error-handler.js'

export const app = express()

/**
 * The main function of the application.
 */
const main = async () => {
  // Connect to db if not executed by test runner.
  if (process.env.NODE_ENV !== 'test') {
    try {
      await connectDB()
    } catch (err) {
      console.error(err.message)
      process.exitCode = 1
      return
    }
  }

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

  // Parse json requests.
  app.use(express.json())

  app.use(cors())

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(errorHandler)
}

main()
