/**
 * Module for WritingsController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import Repository from '../models/repository'

/**
 * Encapsulates a controller.
 */
export default class WritingsController {
  /**
   *  Initializes controller.
   */
  constructor () {
    this.repository = new Repository()
  }

  /**
   * Creates a writing in database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async createWriting (req, res, next) {
    // Writing data from client + userId from authorized user.
    const writingData = { ...req.body, userId: req.authorizedUser._id }
    try {
      await this.repository.createWriting(writingData)
      res.status(201).send({ message: 'Writing created successfully.' })
    } catch (error) {
      next(error)
    }
  }
}
