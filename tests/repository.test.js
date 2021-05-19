import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import dbHandler from './helper-modules/in-memory-mongodb-handler.cjs'
import Repository from '../src/models/repository'
import {
  assertThatUserDoesNotExistsInDatabase,
  assertThatUserExistsInDatabase, assertThatValidJWTWasReturned, assertThrowsExceptionWhenTryingToSignIn,
  createUser, decodeSignInToken, signInUser
} from './helper-modules/user-helper'
import { assertThatWritingExistsInDatabase, createWritings } from './helper-modules/writing-helper'

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
      // Arrange
      const userCredentials = {
        username: 'Bradley',
        password: 'eoulxn2u'
      }

      // Act
      await createUser(userCredentials)

      // Assert
      await assertThatUserExistsInDatabase(userCredentials)
    })

    it('creates and stores a user when username is maximum 100 characters', async () => {
      // Arrange
      const userCredentials = {
        username: 'ujbleunfbuiretyleuidlkudeoubljoeadugdbnoetjdhtnoeaduhoejubdgcdjsnoeuxb,gcdu.,cgdujb.rcpudb.pgcrurj$#',
        password: 'bouloreacdu/oar'
      }

      // Act
      await createUser(userCredentials)

      // Assert
      await assertThatUserExistsInDatabase(userCredentials)
    })

    it('does not create and store a user when username is above 100 characters', async () => {
      // Arrange
      const userCredentials = {
        username: 'boebuldgcNSSDHHT#@$#)ntseousnthoeuxthxoei@#$@#oeuntoeuNTXNHTXHNTICNGDNDNCHNTXBshht[09{)&*(&)nthb.cbo#',
        password: 'bouloreacdu/oar'
      }
      // Act
      await expect(createUser(userCredentials)).rejects.toThrow()

      // Assert
      assertThatUserDoesNotExistsInDatabase(userCredentials)
    })

    it('does not create and store a user when password is shorter than 8 characters', async () => {
      // Arrange
      const userCredentials = {
        username: 'Mickey',
        password: 'aod09eu'
      }

      // Act
      await expect(createUser(userCredentials)).rejects.toThrow()

      // Assert
      assertThatUserDoesNotExistsInDatabase(userCredentials)
    })

    it('does not create and store a user when password is omitted', async () => {
      // Arrange
      const userCredentials = {
        username: 'Benjamin'
      }

      // Act
      await expect(repository.createUser(userCredentials)).rejects.toThrow()

      // Assert
      assertThatUserDoesNotExistsInDatabase(userCredentials)
    })

    it('does not create and store a user when username is omitted', async () => {
      // Arrange
      const userCredentials = {
        password: '90824b4 jpfie0 fy087j joe'
      }

      // Act
      await expect(repository.createUser(userCredentials)).rejects.toThrow()

      // Assert
      assertThatUserDoesNotExistsInDatabase(userCredentials)
    })
  })

  describe('signInUser method', () => {
    it('signs in user and returns a valid jwt-token when credentials are valid', async () => {
      // Arrange
      const userCredentials = {
        username: 'Micheal Jackson',
        password: '90824453987dtnhui'
      }
      await createUser(userCredentials)

      // Act
      const jwtSignInToken = await signInUser(userCredentials)

      // Assert
      assertThatValidJWTWasReturned(jwtSignInToken)
    })

    it('does not sign in user when credentials are invalid', async () => {
      // Arrange
      const correctUserCredentials = {
        username: 'Lars Ohly',
        password: '908(*)idcrrgeu)'
      }
      const wrongUserCredentials = {
        username: 'Lars Ohly',
        password: '(xthnoenu342)'
      }
      await createUser(correctUserCredentials)

      // Act + Assert
      assertThrowsExceptionWhenTryingToSignIn(wrongUserCredentials)
    })
  })

  describe('retriveUserById method', () => {
    it('retrieves user when id is valid', async () => {
      // Arrange
      const userCredentials = {
        username: 'Peter Stormare',
        password: '90824(*DRG(Cue)'
      }

      await createUser(userCredentials)
      const jwtSignInToken = await signInUser(userCredentials)
      const decodedToken = decodeSignInToken(jwtSignInToken)

      // Act
      const dbUser = await repository.retrieveUserById(decodedToken.id)

      // Assert
      expect(dbUser.username).toEqual(userCredentials.username)
    })

    it('throws exception when user id is invalid', async () => {
      // Arrange
      const invalidUserId = 'InvalidUserId.098oeu908g,8.'

      // Act + Assert
      await expect(repository.retrieveUserById(invalidUserId)).rejects.toThrow()
    })
  })

  describe('createWriting method', () => {
    it('creates writing when input is valid', async () => {
      // Arrange
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

      // Act
      await repository.createWriting(writingData)

      // Assert
      assertThatWritingExistsInDatabase(writingData)
    })

    it('throws exception when userId is empty', async () => {
      // Arrange
      const writingData = {
        userId: '',
        title: 'Some test title',
        text: 'Some text for testing...',
        active: true
      }

      // Act + Assert
      await expect(repository.createWriting(writingData)).rejects.toThrow()
    })

    it('throws exception when title is empty', async () => {
      // Arrange
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

      // Act + Assert
      await expect(repository.createWriting(writingData)).rejects.toThrow()
    })

    it('throws exception when text is empty', async () => {
      // Arrange
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

      // Act + Assert
      await expect(repository.createWriting(writingData)).rejects.toThrow()
    })

    it('throws exception when active is omitted', async () => {
      // Arrange
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

      // Act + Assert
      await expect(repository.createWriting(writingData)).rejects.toThrow()
    })
  })
  describe('retrieveWritings method', () => {
    it('retrieves all writings', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Magnus Uggla', password: 'oeu987dhou9843' }))._id
      const createdWritings = await createWritings(3, userId)

      // Act
      const retrievedWritings = await repository.retrieveWritings(userId)

      // Assert
      expect(JSON.stringify(createdWritings)).toEqual(JSON.stringify(retrievedWritings))
    })

    it('returns an empty array if user id is invalid', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Magnus Uggla', password: 'oeu987dhou9843' }))._id
      await createWritings(3, userId)

      // Act
      const retrievedWritings = await repository.retrieveWritings(userId + '#')

      // Assert
      expect(retrievedWritings).toEqual([])
    })

    it('returns an empty array if user has no writings', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Magnus Uggla', password: 'oeu987dhou9843' }))._id

      // Act
      const retrievedWritings = await repository.retrieveWritings(userId + '#')

      // Assert
      expect(retrievedWritings).toEqual([])
    })
  })
})
