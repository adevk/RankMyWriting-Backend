/**
 * Module for Repository.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import User from './user.js'
import Writing from './writing.js'
import createError from 'http-errors'

/**
 * Repository abstracting database tasks.
 */
export default class Repository {
  /**
   * Creates a user account in repository.
   *
   * @param {object} userData - The user data from the client.
   * @returns {object} The user object.
   */
  async createUser (userData) {
    try {
      // Create a user model.
      const user = new User({
        username: userData.username,
        password: userData.password
      })
      // Save user to the database.
      return await user.save()
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error)
      }
      if (error.code === 11000) {
        throw createError(409, error)
      }
      throw createError(500, error)
    }
  }

  /**
   * Signs in a user.
   *
   * @param {object} userData - The user data from the client.
   * @returns {string} JWT token for signed-in user.
   */
  async signInUser (userData) {
    try {
      // Authenticate a user.
      const dbUser = await User.authenticate(userData.username, userData.password)
      const jwtSignInToken = dbUser.generateSignedJwtToken()
      return jwtSignInToken
    } catch (error) {
      throw createError(401, error)
    }
  }

  /**
   * Retrieves user by id from repository.
   *
   * @param {string} userId - The user id.
   * @returns {object} The retrieved user.
   */
  async retrieveUserById (userId) {
    try {
      const dbUser = await User.findById(userId)
      return dbUser
    } catch (error) {
      throw createError(404, 'There is no user with this id.')
    }
  }

  /**
   * Creates a writing in repository.
   *
   * @param {object} writingData - The writing data from the client.
   * @returns {object} The writing object.
   */
  async createWriting (writingData) {
    try {
      // Create a writing model.
      const writing = new Writing({
        userId: writingData.userId,
        title: writingData.title,
        text: writingData.text
      })
      // Save user to the database.
      return await writing.save()
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error)
      } else {
        throw createError(500)
      }
    }
  }

  // TODO Rename id property for writing returned to client

  /**
   * Retrieves all writings for a particular user.
   *
   * @param {string} userId - The user id of the user whose writings shall be retrieved.
   *
   * @returns {Array} The array containing all the user's writings.
   */
  async retrieveWritings (userId) {
    try {
      const writings = await Writing.find({ userId: userId })
      return writings
    } catch (error) {
      throw createError(500)
    }
  }

  /**
   * Adds a vote to a specific writing.
   *
   * @param {object} voteObj - The object containing the vote data and writing id.
   * @param {object} votingUser - The user that's casting a vote.
   *
   * @returns {Array} The array containing all the user's writings.
   */
  async addVoteToWriting (voteObj, votingUser) {
    try {
      const writing = await this.retrieveWritingById(voteObj.writingId)
      // If it's the first vote, just save the vote as the score.
      if (writing.votes === 0) {
        writing.set({
          score: {
            comprehensible: voteObj.comprehensible,
            engaging: voteObj.engaging,
            convincing: voteObj.convincing
          }
        })
      } else {
        // If it's not the first vote, calculate and save the average of all previous votes.
        writing.set({
          score: {
            comprehensible: this._calculateAverageScore(writing.score.comprehensible, writing.votes, voteObj.comprehensible),
            engaging: this._calculateAverageScore(writing.score.engaging, writing.votes, voteObj.engaging),
            convincing: this._calculateAverageScore(writing.score.convincing, writing.votes, voteObj.convincing)
          }
        })
      }
      writing.votes += 1
      await writing.save()
      // Increment the voting user's points.
      await User.findByIdAndUpdate({ _id: votingUser._id }, { points: votingUser.points + 1 })
      return writing
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error)
      } else {
        throw createError(500)
      }
    }
  }

  /**
   * Retrieves a random writing for voting on.
   *
   * @param {string} userId - The user id of the user whose writings shall be retrieved.
   *
   * @returns {object} The retrieved writing.
   */
  async retrieveRandomWritingForVoting (userId) {
    try {
      // Gets all writings of other users.
      const filteredWritings = await Writing.find({ userId: { $ne: userId } })
      // Extracts a random writing from the other users' writings.
      const randomWriting = filteredWritings[Math.floor(Math.random() * filteredWritings.length)]
      return randomWriting
    } catch (error) {
      throw createError(500)
    }
  }

  /**
   * Retrieves a specific writing by id.
   *
   * @param {string} writingId - The id of the writing to be retrieved.
   *
   * @returns {object} The retrieved writing.
   */
  async retrieveWritingById (writingId) {
    try {
      const writing = await Writing.findById(writingId)
      return writing
    } catch (error) {
      throw createError(500)
    }
  }

  /**
   * A helper function for calculating the average score of all previous values of a field
   *
   * @param {number} previousValue - The previous average score before adding the next value.
   * @param {number} previousVotes - The total previous votes on the writing before adding the next one.
   * @param {number} newValue - The new value to be added to the previous average score when calculating a new one.
   *
   * @returns {number} The new calculated average score.
   */
  _calculateAverageScore (previousValue, previousVotes, newValue) {
    const factor = previousVotes
    const divisor = factor + 1
    return ((previousValue * factor + newValue) / divisor)
  }
}
