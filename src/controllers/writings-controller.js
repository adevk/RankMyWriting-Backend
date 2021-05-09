/**
 * Module for WritingsController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import createError from 'http-errors'
import Writing from '../models/writing.js'

/**
 * Encapsulates a controller.
 */
export default class WritingsController {
  /**
   * Creates a writing in database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    // Confirm that username is not taken.
    try {
      console.log('From writing controller')
      // Create a writing model.
      const writing = new Writing({
        userId: req.user._id,
        title: req.body.title,
        text: req.body.text,
        active: req.body.active

      })
      // Save user to the database.
      await writing.save()

      res.status(201).send({ message: 'Writing created successfully.' })
    } catch (error) {
      if (error.name === 'ValidationError') {
        next(createError(400, error.message))
      } else {
        next(createError(500))
      }
    }
  }
}
