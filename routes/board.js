var express = require('express')
var router = express.Router()
var boardController = require('../controllers/boardController')

router.get('/:board/', boardController.board)
router.get('/:board/:threadid', boardController.thread)

module.exports = router
