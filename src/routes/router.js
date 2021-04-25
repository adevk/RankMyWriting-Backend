/**
 * The routes.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { Controller } from '../controllers/controller.js'
import authorize from '../middleware/auth.js'

export const router = express.Router()

const controller = new Controller()

router.get('/', controller.index)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/dashboard', authorize, controller.dashboard)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
