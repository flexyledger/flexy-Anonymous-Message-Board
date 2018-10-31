var express = require('express')
var router = express.Router()
var apiController = require('../controllers/apiController')

router.get('/threads/:board', apiController.getThread)
router.post('/threads/:board', apiController.postThread)
router.delete('/threads/:board', apiController.deleteThread)
router.put('/threads/:board', apiController.reportThread)
router.get('/replies/:board', apiController.getReplies)
router.post('/replies/:board', apiController.postReplies)
router.delete('/replies/:board', apiController.deleteReply)
router.put('/replies/:board', apiController.reportReply)
module.exports = router
