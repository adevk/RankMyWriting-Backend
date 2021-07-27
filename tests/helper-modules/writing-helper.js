/**
 * A helper module for testing.
 *
 * Contains functions for helping in testing code related to the writing model/object.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

import { expect } from '@jest/globals'
import User from '../../src/models/user'
import Repository from '../../src/models/repository'
import jwt from 'jsonwebtoken'
import Writing from '../../src/models/writing'

const repository = new Repository()

/**
 * A function for creating writings in repository during testing.
 *
 * @param {number} numberOfWritings - The number of writings to be created.
 * @param {string} userId - The user id of the user owning the writings.
 *
 * @returns {Array} Array containing all the writings.
 */
export const createWritings = async (numberOfWritings, userId) => {
  const writings = []
  for (let i = 0; i < numberOfWritings; i++) {
    const writing = await repository.createWriting({
      userId: userId,
      title: `Writing ${i}`,
      text: `This is writing ${i}`
    })
    writings.push(writing)
  }
  return writings
}

/**
 * A function for creating a user in repository during testing.
 *
 * @param {object} writingData - The writing data.
 */
export const assertThatWritingExistsInDatabase = async (writingData) => {
  const dbWriting = await Writing.findOne(writingData)
  expect(dbWriting.userId).toBeTruthy()
  expect(dbWriting.title).toEqual(writingData.title)
  expect(dbWriting.text).toEqual(writingData.text)
}
