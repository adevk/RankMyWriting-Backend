import express from 'express'
import WritingsController from '../controllers/writings-controller.js'
import authorize from '../middleware/auth.js'

const writingsRouter = express.Router()

const writingsController = new WritingsController()

writingsRouter.post('/create', authorize, (req, res, next) => writingsController.createWriting(req, res, next))
writingsRouter.post('/:id/vote', authorize, (req, res, next) => writingsController.voteOnWriting(req, res, next))
writingsRouter.get('/retrieve', authorize, (req, res, next) => writingsController.retrieveWritings(req, res, next))
writingsRouter.get('/random', authorize, (req, res, next) => writingsController.retrieveRandomWriting(req, res, next))

export default writingsRouter
