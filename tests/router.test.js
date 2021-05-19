import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { app } from '../src/server.js'
import Repository from '../src/models/repository'
import User from '../src/models/user.js'
import Writing from '../src/models/writing.js'
import jwt from 'jsonwebtoken'
import { createUser, signInUser } from './helper-modules/user-helper'
import { assertThatWritingExistsInDatabase, createWritings } from './helper-modules/writing-helper'
import dbHandler from './helper-modules/in-memory-mongodb-handler.cjs'

const request = supertest(app)

const registrationPath = '/users/register'
const loginPath = '/users/login'
const writingCreationPath = '/writings/create'

process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
process.env.JWT_EXPIRE = '86400'

describe('Router', () => {
  beforeAll(async () => {
    await dbHandler.connect()
  })

  afterEach(async () => {
    await dbHandler.clearDatabase()
  })

  afterAll(async () => {
    await dbHandler.disconnect()
  })

  describe('Registration endpoint', () => {

    it('registers a new user in database', async () => {
      const username = 'Danny'
      const password = '11111111'

      // Send request to create user.
      await request.post(registrationPath)
        .send({ username: username, password: password })
        .expect('Content-Type', /json/)
        .expect(201, { message: 'Account created successfully.' })

      const dbUser = await User.findOne({ username })
      expect(dbUser._id).toBeTruthy()

      // Send request to create duplicate user (should fail).
      const otherPassword = '22222222'
      await request.post('/users/register')
        .send({ username: username, password: otherPassword })
        .expect('Content-Type', /json/)
        .expect(400)

      const userCount = await User.count()
      expect(userCount).toBe(1)
    })

    it('does not register user with short password', async () => {
      const username = 'Vdra#'
      const password = '1111111'

      // Send request to create user.
      await request.post(registrationPath)
        .send({ username: username, password: password })
        .expect('Content-Type', /json/)
        .expect(400, { message: 'User validation failed: password: The password must consist of at least 8 characters.' })

      expect(await User.count()).toBe(0)
    })

    it('does not register user with invalid data', async () => {
      const username = 'Benjamin'
      const password = '11111114233'

      // Send request to create user.
      await request.post(registrationPath)
        .send({ username: username })
        .expect('Content-Type', /json/)
        .expect(400)

      await request.post(registrationPath)
        .send({ password: password })
        .expect('Content-Type', /json/)
        .expect(400)

      await request.post(registrationPath)
        .send({ username: '', password: '' })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(await User.count()).toBe(0)
    })
  })

  describe('Login endpoint', () => {

    it('logs in user with valid data', async () => {
      // For JWT generation.
      process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
      process.env.JWT_EXPIRE = '86400'

      const username = 'Manny'
      const password = '798#5p987oeu'

      // Initiate db with a user to login with.
      const repository = new Repository()
      const user = await repository.createUser({ username, password })

      const response = await request.post(loginPath)
        .send({ username: username, password: password })
        .expect('Content-Type', /json/)
        .expect(200)

      const token = response.body.token
      expect(jwt.verify(token, process.env.JWT_SECRET)).toBeTruthy()
    })

    it('does not log in user with invalid data', async () => {
      // For JWT generation.
      process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
      process.env.JWT_EXPIRE = '86400'

      const username = 'Manny'
      const password = '798#5p987oeu'

      // Initiate db with a user to login with.
      const user = new User({
        username: username,
        password: password
      })
      await user.save()

      // Send request to create user.
      let response
      response = await request.post(loginPath)
        .send({ username: username })
        .expect('Content-Type', /json/)
        .expect(401)
      expect(response.body.token).toBeFalsy()

      response = await request.post(loginPath)
        .send({ password: password })
        .expect('Content-Type', /json/)
        .expect(401)
      expect(response.body.token).toBeFalsy()

      response = await request.post(loginPath)
        .send({ username: '', password: '' })
        .expect('Content-Type', /json/)
        .expect(401)
      expect(response.body.token).toBeFalsy()

      response = await request.post(loginPath)
        .expect('Content-Type', /json/)
        .expect(401)
      expect(response.body.token).toBeFalsy()
    })
  })

  describe('Writing-creation endpoint', () => {

    it('creates a writing in database', async () => {
      // For JWT generation.
      process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
      process.env.JWT_EXPIRE = '86400'

      const username = 'Sbroeuar'
      const password = '798#5p987ooeua((^eu'

      // Initiate db with a user to login with.
      const user = new User({
        username: username,
        password: password
      })
      await user.save()

      let response
      // Sign in user.
      response = await request.post(loginPath)
        .send({ username: username, password: password })
        .expect('Content-Type', /json/)
        .expect(200)

      const token = response.body.token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      expect(decodedToken.id).toBeTruthy()

      // Create writing.

      const userId = decodedToken.id
      const title = 'Alice in wonderland.'
      const text = 'utanosu hoaesuhtao esuntoeauh oaaoe suht...'
      const active = false

      response = await request.post(writingCreationPath)
        .send({
          userId,
          title,
          text,
          active
        })
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201, { message: 'Writing created successfully.' })

      const dbWriting = await Writing.findOne({ userId })
      expect(dbWriting.title).toBe('Alice in wonderland.')
    })

    it('does not create a writing in database', async () => {
      // For JWT generation.
      process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
      process.env.JWT_EXPIRE = '86400'

      const username = 'Sbroeuar'
      const password = '798#5p987ooeua((^eu'

      // Initiate db with a user to login with.
      const user = new User({
        username: username,
        password: password
      })
      await user.save()

      let response
      // Sign in user.
      response = await request.post(loginPath)
        .send({ username: username, password: password })
        .expect('Content-Type', /json/)
        .expect(200)

      const token = response.body.token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      expect(decodedToken.id).toBeTruthy()

      // Create writing.

      const userId = decodedToken.id
      const title = 'Alice in wonderland.'
      const active = false

      response = await request.post(writingCreationPath)
        .send({
          userId,
          title,
          active
        })
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(400, { message: 'Writing validation failed: text: Path `text` is required.' })

      const dbWriting = await Writing.findOne({ userId })
      expect(dbWriting).toBeFalsy()
    })
  })

  describe('Endpoint for fetching all writings', () => {
    it('fetches all a user\'s writings when user is signed in', async () => {
      // Arrange
      const userCredentials = {
        username: 'Petter',
        password: '90theoud98>P@#'
      }
      const user = await createUser(userCredentials)
      const userId = user._id.toString()
      const jwtSignInToken = await signInUser(userCredentials)
      const createdWritings = await createWritings(3, userId)

      // Act + Assert
      await request.get('/writings/retrieve')
        .send({ userId: userId })
        .set('Authorization', `Bearer ${jwtSignInToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const retrievedWritings = response.body.data
          expect(JSON.stringify(createdWritings)).toEqual(JSON.stringify(retrievedWritings))
        })
    })

    it('returns 401 if sign-in credentials are invalid', async () => {
      // Arrange
      const userCredentials = {
        username: 'Petter',
        password: '90theoud98>P@#'
      }
      const user = await createUser(userCredentials)
      const userId = user._id.toString()
      const invalidToken = 'oeundeodunt.neotudeotnhut.enotuhoenthu'
      await createWritings(3, userId)

      // Act + Assert
      await request.get('/writings/retrieve')
        .send({ userId: userId })
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect('Content-Type', /json/)
        .expect(401)
    })

    it('returns empty array if user has no writings', async () => {
      // Arrange
      const userCredentials = {
        username: 'Petter',
        password: '90theoud98>P@#'
      }
      const user = await createUser(userCredentials)
      const userId = user._id.toString()
      const jwtSignInToken = await signInUser(userCredentials)

      // Act + Assert
      await request.get('/writings/retrieve')
        .send({ userId: userId })
        .set('Authorization', `Bearer ${jwtSignInToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const retrievedWritings = response.body.data
          expect(retrievedWritings).toEqual([])
        })
    })
  })
})
