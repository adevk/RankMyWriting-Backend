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
        text: 'Some text for testing...'
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

  describe('addVoteToWriting method', () => {
    it('adds a vote to the specified writing when voteObject and writingId are valid', async () => {
      // Arrange
      const votingUser = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))
      const writingUser = (await createUser({ username: 'Jack the ripper', password: 'oeu*&%*%&^843$#' }))
      const createdWritings = await createWritings(1, writingUser._id)
      const writingId = createdWritings[0]._id.toString()

      const voteObject1 = {
        comprehensible: 3,
        engaging: 2,
        convincing: 4,
        writingId: writingId
      }

      // Act
      const writing = await repository.addVoteToWriting(voteObject1, votingUser)

      // Assert
      expect(writing.score).toEqual(expect.objectContaining({
        comprehensible: 3,
        engaging: 2,
        convincing: 4
      }))
    })

    it('adds the average score of the votes of a writing when casting the second vote', async () => {
      // Arrange
      const votingUser1 = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))
      const votingUser2 = (await createUser({ username: 'Benjamin Fraknlin', password: 'oeu987dhou9843$#' }))
      const writingUser = (await createUser({ username: 'Jack the ripper', password: 'oeu*&%*%&^843$#' }))
      const createdWritings = await createWritings(1, writingUser._id)
      const writingId = createdWritings[0]._id.toString()

      const voteObject1 = {
        comprehensible: 3,
        engaging: 2,
        convincing: 4,
        writingId: writingId
      }

      const voteObject2 = {
        comprehensible: 5,
        engaging: 2,
        convincing: 0,
        writingId: writingId
      }

      // Act
      await repository.addVoteToWriting(voteObject1, votingUser1)
      const updatedWriting = await repository.addVoteToWriting(voteObject2, votingUser2)
      const roundedScore = {
        comprehensible: Math.round(updatedWriting.score.comprehensible),
        engaging: Math.round(updatedWriting.score.engaging),
        convincing: Math.round(updatedWriting.score.convincing)
      }

      // Assert
      expect(roundedScore).toEqual({
        comprehensible: 4,
        engaging: 2,
        convincing: 2
      })
    })

    it('adds the average score of the votes of a writing when casting the seventh vote', async () => {
      // Arrange
      const votingUser = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))
      const votingUser2 = (await createUser({ username: 'Benjamin Franklin', password: 'oeu987dhou9843$#' }))
      const votingUser3 = (await createUser({ username: 'Bill Clinton', password: '*()&(*)&(*&*(*)(&(*&#' }))
      const writingUser = (await createUser({ username: 'Jack the ripper', password: 'oeu*&%*%&^843$#' }))
      const createdWritings = await createWritings(1, writingUser._id)
      const writingId = createdWritings[0]._id.toString()

      const voteObject1 = {
        comprehensible: 3,
        engaging: 2,
        convincing: 4,
        writingId: writingId
      }

      const voteObject2 = {
        comprehensible: 5,
        engaging: 2,
        convincing: 0,
        writingId: writingId
      }

      const voteObject3 = {
        comprehensible: 3,
        engaging: 1,
        convincing: 0,
        writingId: writingId
      }

      const voteObject4 = {
        comprehensible: 5,
        engaging: 2,
        convincing: 5,
        writingId: writingId
      }

      const voteObject5 = {
        comprehensible: 2,
        engaging: 2,
        convincing: 4,
        writingId: writingId
      }

      const voteObject6 = {
        comprehensible: 1,
        engaging: 1,
        convincing: 0,
        writingId: writingId
      }

      const voteObject7 = {
        comprehensible: 4,
        engaging: 3,
        convincing: 5,
        writingId: writingId
      }

      // Act
      await repository.addVoteToWriting(voteObject1, votingUser)
      await repository.addVoteToWriting(voteObject2, votingUser2)
      await repository.addVoteToWriting(voteObject3, votingUser3)
      await repository.addVoteToWriting(voteObject4, votingUser)
      await repository.addVoteToWriting(voteObject5, votingUser3)
      await repository.addVoteToWriting(voteObject6, votingUser)
      const updatedWriting = await repository.addVoteToWriting(voteObject7, votingUser)
      const roundedScore = {
        comprehensible: Math.round(updatedWriting.score.comprehensible),
        engaging: Math.round(updatedWriting.score.engaging),
        convincing: Math.round(updatedWriting.score.convincing)
      }

      // Assert
      expect(roundedScore).toEqual({
        comprehensible: 3,
        engaging: 2,
        convincing: 3
      })
    })

    it("increments a user's points when he receives a vote on his writing", async () => {
      // Arrange
      const votingUser = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))
      const votingUserOldPoints = votingUser.points
      const writingUser = (await createUser({ username: 'Jack the ripper', password: 'oeu*&%*%&^843$#' }))
      const createdWritings = await createWritings(1, writingUser._id)
      const writingId = createdWritings[0]._id.toString()

      const voteObject = {
        comprehensible: 3,
        engaging: 2,
        convincing: 4,
        conversational: true,
        positive: false,
        personal: true,
        writingId: writingId
      }

      // Act
      await repository.addVoteToWriting(voteObject, votingUser)

      // Assert
      const updatedUser = await repository.retrieveUserById(votingUser._id)
      expect(updatedUser.points).toEqual(votingUserOldPoints + 1)
    })

    it('Increment the votes field of the writing that was voted on', async () => {
      // Arrange
      const votingUser = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))
      const writingUser = (await createUser({ username: 'Jack the ripper', password: 'oeu*&%*%&^843$#' }))
      const createdWritings = await createWritings(1, writingUser._id)
      const writing = createdWritings[0]
      const writingId = writing._id.toString()
      const writingOldVotes = writing.votes

      const voteObject = {
        comprehensible: 3,
        engaging: 2,
        convincing: 4,
        conversational: true,
        positive: false,
        personal: true,
        writingId: writingId
      }

      // Act
      await repository.addVoteToWriting(voteObject, votingUser)

      // Assert
      const updatedWriting = await repository.retrieveWritingById(writingId)
      expect(updatedWriting.votes).toEqual(writingOldVotes + 1)
    })

    it('throws an exception when an attribute has a value above the limit', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))._id
      const createdWritings = await createWritings(1, userId)
      const writingId = createdWritings[0]._id.toString()

      const voteObject = {
        comprehensible: 3,
        engaging: 4,
        convincing: 6,
        conversational: true,
        positive: false,
        personal: true,
        writingId: writingId
      }

      // Act + Assert
      await expect(repository.addVoteToWriting(voteObject)).rejects.toThrow()
    })

    it('throws an exception when an attribute has a value below the limit', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))._id
      const createdWritings = await createWritings(1, userId)
      const writingId = createdWritings[0]._id.toString()

      const voteObject = {
        comprehensible: -1,
        engaging: 2,
        convincing: 5,
        conversational: true,
        positive: false,
        personal: true,
        writingId: writingId
      }

      // Act + Assert
      await expect(repository.addVoteToWriting(voteObject)).rejects.toThrow()
    })

    it('throws an exception when a tone is null', async () => {
      // Arrange
      const userId = (await createUser({ username: 'Nikola Tesla', password: 'oeu987dhou9843$#' }))._id
      const createdWritings = await createWritings(1, userId)
      const writingId = createdWritings[0]._id.toString()

      const voteObject = {
        comprehensible: 0,
        engaging: 3,
        convincing: 2,
        conversational: true,
        positive: null,
        personal: true,
        writingId: writingId
      }

      // Act + Assert
      await expect(repository.addVoteToWriting(voteObject)).rejects.toThrow()
    })
  })

  describe('retrieveRandomWritingForVoting method', () => {
    it('gets a random writing that is not owned by the voting user', async () => {
      // Arrange
      const user1 = (await createUser({ username: 'user1', password: 'toeu87y6oeu' }))
      const user2 = (await createUser({ username: 'user2', password: 'oeu987dh*&^(#' }))
      const user3 = (await createUser({ username: 'user3', password: 'oeu987dh#@4' }))
      await createWritings(5, user1._id)
      await createWritings(1, user2._id)
      await createWritings(1, user3._id)

      const user1Id = user1._id.toString()

      // Act
      const randomWriting = await repository.retrieveRandomWritingForVoting(user1Id)

      // Assert
      expect(randomWriting.userId).not.toEqual(user1Id)
    })
  })
})
