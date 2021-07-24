/**
 * Module for Repository.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import User from './user.js'
import Writing from './writing.js'
import Vote from './vote.js'
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
    // Confirm that username is not taken.
    if (!await User.findOne({ username: userData.username })) {
      try {
        // Create a user model.
        const user = new User({
          username: userData.username,
          password: userData.password
        })
        // Save user to the database.
        return (await user.save()).toObject()
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw createError(400, error.message)
        } else {
          throw createError(500)
        }
      }
    } else {
      // 400 Bad request (user already exists).
      throw createError(400)
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
      throw createError(401, error.message)
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
      return dbUser.toObject()
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
        text: writingData.text,
        active: writingData.active

      })
      // Save user to the database.
      return (await writing.save()).toObject()
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error.message)
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
   *
   * @returns {Array} The array containing all the user's writings.
   */
  async addVoteToWriting (voteObj) {
    try {
      const vote = new Vote(voteObj)
      return (await vote.save()).toObject()
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw createError(400, error.message)
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
      const randomWriting = filteredWritings[Math.floor(Math.random() * filteredWritings.length)]
      return randomWriting
    } catch (error) {
      throw createError(500)
    }
  }
}

// /**
//  * Retrieves a specific writing by id.
//  *
//  * @param {string} writingId - The id of the writing to be retrieved.
//  *
//  * @returns {object} The retrieved writing.
//  */
// async retrieveWritingById (writingId) {
//   try {
//     const writing = await Writing.findById(writingId)
//     return writing
//   } catch (error) {
//     throw createError(500)
//   }
// }
