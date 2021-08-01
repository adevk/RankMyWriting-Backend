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
   * Initializes a WritingsController.
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
    const votingUser = req.authorizedUser

    try {
      const voteObj = { ...voteData, writingId }
      await this.repository.addVoteToWriting(voteObj, votingUser)
      res.status(201).send({ message: 'Vote successfully added to writing.' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Retrieves all writings from repository.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async retrieveWritings (req, res, next) {
    const authorizedUser = req.authorizedUser
    const userId = authorizedUser._id.toString()
    try {
      const retrievedWritings = await this.repository.retrieveWritings(userId)
      if (retrievedWritings.length === 0) {
        res.status(200).send({ writings: retrievedWritings, points: authorizedUser.points, message: 'There are no writings for this user.' })
      } else {
        res.status(200).send({ writings: retrievedWritings, points: authorizedUser.points, message: 'Writings retrieved successfully.' })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Retrieves a random writing for voting on from repository.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async retrieveRandomWriting (req, res, next) {
    const userId = req.authorizedUser._id.toString()
    try {
      const randomWriting = await this.repository.retrieveRandomWritingForVoting(userId)
      const message = randomWriting ? 'Retrieved a random writing for voting.' : 'There are no writings to vote on'
      res.status(200).send({ data: randomWriting, message: message })
    } catch (error) {
      next(error)
    }
  }
}
