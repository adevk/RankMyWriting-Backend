/**
 * Module for WritingsController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import Repository from '../models/repository.js'

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

  /**
   * Creates all writings from repository.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async retriveWritings (req, res, next) {
    const userId = req.authorizedUser._id.toString()
    try {
      const retrievedWritings = await this.repository.retrieveWritings(userId)
      if (retrievedWritings.length === 0) {
        res.status(200).send({ data: retrievedWritings, message: 'There are no writings for this user.' })
      } else {
        res.status(200).send({ data: retrievedWritings, message: 'Writings retrieved successfully.' })
      }
    } catch (error) {
      next(error)
    }
  }
}
