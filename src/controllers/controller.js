/**
 * Module for HomeController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */
import createError from 'http-errors'
import Text from '../models/text.js'


/**
 * Encapsulates a controller.
 */
export class Controller {
  /**
   * Displays the homepage.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async index (req, res) {
    const data = await Text.find({})
    res.status(200).send(data)
  }
  /**
   * Create a text in db.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create (req, res, next) {
    try {
      const textData = req.body
      const text = new Text({
        content: textData.content
      })

      await text.save()

      res.status(201).send(textData)
    } catch (err) {
      // Create an error and pass it to error-handling middleware.
      next(createError(err.status))
    }

  }
}
