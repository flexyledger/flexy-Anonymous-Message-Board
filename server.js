'use strict'
try {
  require('dotenv').config()
} catch (e) {
  console.log('no dotenv module')
}
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var helmet = require('helmet')
var fccTestingRoutes = require('./routes/fcctesting.js')
var runner = require('./test-runner')
var mongoose = require('mongoose')
var index = require('./routes/index')
var api = require('./routes/api')
var board = require('./routes/board')
var app = express()
app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
app.use('/public', express.static(process.cwd() + '/public'))
app.use(cors({origin: '*'})) // For FCC testing purposes only
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URI)
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/', index)
app.use('/api', api)
app.use('/b', board)

// For FCC testing purposes
fccTestingRoutes(app)

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found')
})

// Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + (process.env.PORT || 3000))
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (e) {
        var error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 1500)
  }
})

module.exports = app
