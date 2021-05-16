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
 * A function for creating a user in repository during testing.
 *
 * @param {object} writingData - The writing data.
 */
export const assertThatWritingExistsInDatabase = async (writingData) => {
  const dbWriting = await Writing.findOne(writingData)
  expect(dbWriting.userId).toBeTruthy()
  expect(dbWriting.title).toEqual(writingData.title)
  expect(dbWriting.text).toEqual(writingData.text)
  expect(dbWriting.active).toEqual(writingData.active)
}
