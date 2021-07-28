/**
 * A helper module for testing.
 *
 * Contains functions for helping in testing code related to the user model/object.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import { expect } from '@jest/globals'
import User from '../../src/models/user'
import Repository from '../../src/models/repository'
import jwt from 'jsonwebtoken'

const repository = new Repository()

/**
 * A function for creating a user in repository during testing.
 *
 * @param {object} userCredentials - The user credentials.
 * @returns {object} The created user.
 */
export const createUser = async (userCredentials) => {
  return await repository.createUser({ username: userCredentials.username, password: userCredentials.password })
}

/**
 * A function for signing in a user and receiving a JWT-token during testing.
 *
 * @param {object} userCredentials - The user credentials.
 * @returns {string} JWT token for signed-in user.
 */
export const signInUser = async (userCredentials) => {
  // Sign in user.
  const jwtSignInToken = await repository.signInUser(userCredentials)
  return jwtSignInToken
}

/**
 * A function for decoding a sign-in token during testing.
 *
 * @param {object} jwtSignInToken - The user credentials.
 * @returns {object} The decoded JWT token .
 */
export const decodeSignInToken = (jwtSignInToken) => {
  const decodedToken = jwt.verify(jwtSignInToken, process.env.JWT_SECRET)
  return decodedToken
}

/**
 * A function for asserting that a user was created in database during testing.
 *
 * @param {object} userCredentials - The user credentials.
 */
export const assertThatUserExistsInDatabase = async (userCredentials) => {
  const dbUser = await User.findOne({ username: userCredentials.username })
  expect(dbUser).toBeTruthy()
  expect(dbUser._id).toBeTruthy()
  expect((userCredentials.username)).toEqual(dbUser.username)
}

/**
 * A function for asserting that a user was not created in database during testing.
 *
 * @param {object} userCredentials - The user credentials.
 */
export const assertThatUserDoesNotExistsInDatabase = async (userCredentials) => {
  expect(await User.findOne({ username: userCredentials.username })).toBeFalsy()
}

/**
 * A function for asserting that sign in succeeded and valid token was returned during testing.
 *
 * @param {object} jwtSignInToken - The user credentials.
 */
export const assertThatValidJWTWasReturned = async (jwtSignInToken) => {
  // Verify that the returned token is valid.
  expect(jwt.verify(jwtSignInToken, process.env.JWT_SECRET)).toBeTruthy()
}

/**
 * A function for asserting that sign in failed and threw exception during testing.
 *
 * @param {object} wrongUserCredentials - The user credentials.
 */
export const assertThrowsExceptionWhenTryingToSignIn = async (wrongUserCredentials) => {
  await expect(repository.signInUser(wrongUserCredentials)).rejects.toThrow()
}
