var express = require('express')
var router = express.Router()

// Index page (static HTML)
router.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

module.exports = router
