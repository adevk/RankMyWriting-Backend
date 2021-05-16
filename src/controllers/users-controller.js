/**
 * Module for UsersController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import Repository from '../models/repository.js'

/**
 * Encapsulates a controller.
 */
export default class UsersController {
  /**
   *  Initializes controller
   */
  constructor () {
    this.repository = new Repository()
  }

  /**
   * Creates a user account in database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async registerUser (req, res, next) {
    // The user credentials sent from client.
    const userData = req.body
    try {
      await this.repository.createUser(userData)
      res.status(201).send({ message: 'Account created successfully.' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logs in a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async signInUser (req, res, next) {
    // The user credentials sent from client.
    const userData = req.body
    try {
      const jwtSignInToken = await this.repository.signInUser(userData)
      res.status(200).json({ success: true, token: jwtSignInToken })
    } catch (error) {
      next(error)
    }
  }
}
