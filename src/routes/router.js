/**
 * The routes.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'

import homeRouter from './home-router.js'
import usersRouter from './users-router.js'
import writingsRouter from './writings-router.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/users', usersRouter)
router.use('/writings', writingsRouter)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
