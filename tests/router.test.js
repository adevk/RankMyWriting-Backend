import { test, expect, beforeAll, afterAll } from '@jest/globals'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { app } from '../src/server.js'
import User from '../src/models/user.js'

const request = supertest(app)

const databaseName = 'test'

beforeAll(async () => {
  const mongoURI = `mongodb://localhost:27017/${databaseName}`
  await mongoose.connect(mongoURI, { useNewUrlParser: true })
})

afterAll(async () => {
  // Removes all created users.
  await User.deleteMany()
  // Closes the Mongoose connection.
  await mongoose.connection.close()
})

test('Register new user in database', async () => {
  const username = 'Danny'
  const password = '11111111'

  // Send request to create user.
  await request.post('/register')
    .send({ username: username, password: password })
    .expect('Content-Type', /json/)
    .expect(201, { message: 'Account created successfully.' })

  const dbUser = await User.findOne({ username })
  expect(dbUser._id).toBeTruthy()

  // Send request to create duplicate user (should fail).
  const otherPassword = '22222222'
  await request.post('/register')
    .send({ username: username, password: otherPassword })
    .expect('Content-Type', /json/)
    .expect(400)

  const userCount = await User.count()
  expect(userCount).toBe(1)
})
