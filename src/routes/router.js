/**
 * The routes.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { Controller } from '../controllers/controller.js'

export const router = express.Router()

const controller = new Controller()

router.get('/', controller.index)
router.post('/create', controller.create)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
