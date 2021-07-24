/**
 * Module for WritingsController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import Repository from '../models/repository.js'

// TODO Add location to responses after creation

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
   * Adds a vote to writing in database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async voteOnWriting (req, res, next) {
    const voteData = req.body
    const writingId = req.params.id

    try {
      const voteObj = { ...voteData, writingId }
      await this.repository.addVoteToWriting(voteObj)
      res.status(201).send({ message: 'Vote successfully added to writing.' })
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
  async retrieveWritings (req, res, next) {
    const userId = req.authorizedUser._id.toString()
    try {
      const retrievedWritings = await this.repository.retrieveWritings(userId)
      if (retrievedWritings.length === 0) {
        // TODO change status code to more correct one
        res.status(200).send({ data: retrievedWritings, message: 'There are no writings for this user.' })
      } else {
        res.status(200).send({ data: retrievedWritings, message: 'Writings retrieved successfully.' })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Retrieves a random writing from repository.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async retrieveRandomWriting (req, res, next) {
    const userId = req.authorizedUser._id.toString()
    try {
      const randomWriting = await this.repository.retrieveRandomWritingForVoting(userId)
      res.status(200).send({ data: randomWriting, message: 'Retrieved a random writing for voting.' })
    } catch (error) {
      next(error)
    }
  }
}
