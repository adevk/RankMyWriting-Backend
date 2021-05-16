import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import dbHandler from './in-memory-mongodb-handler.cjs'
import Repository from '../src/models/repository'
import User from '../src/models/user'
import Writing from '../src/models/writing'
import jwt from 'jsonwebtoken'

const repository = new Repository()
process.env.JWT_SECRET = '3f1ee83429c5b7567912c03a2ddb456102c8fa38e770028d17e0db57284db92cfeafeff2c2a820de1edad318ccfdb523'
process.env.JWT_EXPIRE = '86400'

describe('Repository', () => {
  beforeAll(async () => {
    await dbHandler.connect()
  })

  afterEach(async () => {
    await dbHandler.clearDatabase()
  })

  afterAll(async () => {
    await dbHandler.disconnect()
  })

  describe('createUser method', () => {
    it('creates and stores a user when input is valid', async () => {
      const userCredentials = {
        username: 'Bradley',
        password: 'eoulxn2u'
      }
      await repository.createUser({ username: userCredentials.username, password: userCredentials.password })

      const dbUser = await User.findOne({ username: userCredentials.username })
      expect(dbUser).toBeTruthy()
      expect(dbUser._id).toBeTruthy()
      expect((userCredentials.username)).toEqual(dbUser.username)
    })

    it('creates and stores a user when username is maximum 100 characters', async () => {
      const userCredentials = {
        username: 'ujbleunfbuiretyleuidlkudeoubljoeadugdbnoetjdhtnoeaduhoejubdgcdjsnoeuxb,gcdu.,cgdujb.rcpudb.pgcrurj$#',
        password: 'bouloreacdu/oar'
      }
      await repository.createUser({ username: userCredentials.username, password: userCredentials.password })

      const dbUser = await User.findOne({ username: userCredentials.username })
      expect(dbUser).toBeTruthy()
      expect(dbUser._id).toBeTruthy()
      expect((userCredentials.username)).toEqual(dbUser.username)
    })

    it('does not create and store a user when username is above 100 characters', async () => {
      const userData = {
        username: 'boebuldgcNSSDHHT#@$#)ntseousnthoeuxthxoei@#$@#oeuntoeuNTXNHTXHNTICNGDNDNCHNTXBshht[09{)&*(&)nthb.cbo#',
        password: 'bouloreacdu/oar'
      }
      await expect(repository.createUser(userData)).rejects.toThrow()
      expect(await User.findOne({ username: userData.username })).toBeFalsy()
    })

    it('does not create and store a user when password is shorter than 8 characters', async () => {
      const userCredentials = {
        username: 'Mickey',
        password: 'aod09eu'
      }
      await expect(repository.createUser(userCredentials)).rejects.toThrow()
      expect(await User.findOne({ username: userCredentials.username })).toBeFalsy()
    })

    it('does not create and store a user when password is omitted', async () => {
      const userCredentials = {
        username: 'Benjamin'
      }
      await expect(repository.createUser(userCredentials)).rejects.toThrow()
      expect(await User.findOne({ username: userCredentials.username })).toBeFalsy()
    })

    it('does not create and store a user when username is omitted', async () => {
      const userCredentials = {
        password: '90824b4 jpfie0 fy087j joe'
      }
      await expect(repository.createUser(userCredentials)).rejects.toThrow()
      expect(await User.findOne({ username: userCredentials.username })).toBeFalsy()
    })
  })

  describe('signInUser method', () => {
    it('signs in user and returns a valid jwt-token when credentials are valid', async () => {
      const userCredentials = {
        username: 'Micheal Jackson',
        password: '90824453987dtnhui'
      }
      // Create a user in db.
      await expect(repository.createUser(userCredentials)).resolves.not.toThrow()
      expect(await User.findOne({ username: userCredentials.username })).toBeTruthy()

      // Sign in user.
      const jwtSignInToken = await repository.signInUser(userCredentials)

      // Verify that the returned token is valid.
      expect(jwt.verify(jwtSignInToken, process.env.JWT_SECRET)).toBeTruthy()
    })

    it('does not sign in user when credentials are invalid', async () => {
      const userCredentials = {
        username: 'Lars Ohly',
        password: '908(*)idcrrgeu)'
      }
      // Create a user in db.
      await expect(repository.createUser(userCredentials)).resolves.not.toThrow()
      expect(await User.findOne({ username: userCredentials.username })).toBeTruthy()

      const wrongUserCredentials = {
        username: 'Lars Ohly',
        password: '(xthnoenu342)'
      }
      // Try to sign in user.
      await expect(repository.signInUser(wrongUserCredentials)).rejects.toThrow()
    })
  })

  describe('retriveUserById method', () => {
    it('retrieves user when id is valid', async () => {
      const userCredentials = {
        username: 'Peter Stormare',
        password: '90824(*DRG(Cue)'
      }
      // Create a user in db.
      await repository.createUser(userCredentials)

      // Sign in user.
      const jwtSignInToken = await repository.signInUser(userCredentials)

      // Decode the sign-in token.
      const decodedToken = jwt.verify(jwtSignInToken, process.env.JWT_SECRET)

      // Retrieve user from repository.
      const userId = decodedToken.id
      const dbUser = await repository.retrieveUserById(userId)
      expect(dbUser.username).toEqual(userCredentials.username)
    })

    it('does not retrieve user when id is invalid', async () => {
      await expect(repository.retrieveUserById('InvalidUserId.098oeu908g,8.')).rejects.toThrow()
    })
  })

  describe('createWriting method', () => {
    it('creates writing when input is valid', async () => {
      const userCredentials = {
        username: 'Luke Skylwalker',
        password: '90824(LIGHTSABER*DRG(Cue)'
      }

      const user = await repository.createUser(userCredentials)

      const writingData = {
        userId: user._id,
        title: 'Some test title',
        text: 'Some text for testing...',
        active: true
      }
      await repository.createWriting(writingData)

      const dbWriting = await Writing.findOne(writingData)
      expect(dbWriting.userId).toBeTruthy()
      expect(dbWriting.title).toEqual(writingData.title)
      expect(dbWriting.text).toEqual(writingData.text)
      expect(dbWriting.active).toEqual(writingData.active)
    })

    it('does not crete writing when userId is empty', async () => {
      const writingData = {
        userId: '',
        title: 'Some test title',
        text: 'Some text for testing...',
        active: true
      }
      await expect(repository.createWriting(writingData)).rejects.toThrow()
      expect(await Writing.findOne(writingData)).toBeFalsy()
    })

    it('does not crete writing when title is empty', async () => {
      const userCredentials = {
        username: 'Anakin Skylwalker',
        password: '90824(SITH*DRG(Cue)'
      }

      const user = await repository.createUser(userCredentials)
      const writingData = {
        userId: user._id,
        title: '',
        text: 'Some text for testing...',
        active: true
      }
      await expect(repository.createWriting(writingData)).rejects.toThrow()
      expect(await Writing.findOne(writingData)).toBeFalsy()
    })

    it('does not create writing when text is empty', async () => {
      const userCredentials = {
        username: 'Darth Vader',
        password: '90824(SITH*DRG(Cue)'
      }

      const user = await repository.createUser(userCredentials)
      const writingData = {
        userId: user._id,
        title: 'Some test title',
        text: '',
        active: false
      }
      await expect(repository.createWriting(writingData)).rejects.toThrow()
      expect(await Writing.findOne(writingData)).toBeFalsy()
    })

    it('does not create writing when active is omitted', async () => {
      const userCredentials = {
        username: 'Obi-Wan Kenobi',
        password: '(^&cgoeuzJEDI(*EUO)'
      }

      const user = await repository.createUser(userCredentials)
      const writingData = {
        userId: user._id,
        title: 'Some test title',
        text: 'Some text for testing...'
      }
      await expect(repository.createWriting(writingData)).rejects.toThrow()
      expect(await Writing.findOne(writingData)).toBeFalsy()
    })
  })
})
