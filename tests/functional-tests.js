/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')
var expect = chai.expect
chai.use(chaiHttp)

suite('Functional Tests', function () {
  let testPass = 'testpass'
  let tText = 'test thread'
  let rText = 'test reply'
  let board = 'test'
  let testThID
  let testReID
  let testThread = {delete_password: testPass, board: board, text: tText}
  let testReply = {delete_password: testPass, board: board, text: rText}
  suite('API ROUTING FOR /api/threads/:board', function () {
    suite('POST', function () {
      test('add thread', function (done) {
        chai.request(server)
          .post('/api/threads/test')
          .send(testThread)
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(err, null)
            expect(res).to.redirect
            testThID = res.redirects[0].split('id=')[1]
            done()
          })
      })
      test('add thread without delete_password', function (done) {
        chai.request(server)
          .post('/api/threads/test')
          .send({board: board, text: tText})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.text, 'need a password', 'needs error without password')
            done()
          })
      })
    })

    suite('GET', function () {
      test('get threads', function (done) {
        chai.request(server)
          .get('/api/threads/test')
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.isAbove(res.body.length, 0, 'Response contains threads')
            assert.property(res.body[0], 'created_on', 'Thread has a created date')
            assert.property(res.body[0], 'bumped_on', 'Thread has a bumped date')
            assert.property(res.body[0], 'board', 'Thread has a board')
            assert.property(res.body[0], 'text', 'Thread has text')
            assert.property(res.body[0], 'replies', 'Thread has replies')
            done()
          })
      })
    })

    suite('PUT', function () {
      test('report thread', function (done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({thread_id: testThID})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'success')
            done()
          })
      })
      test('report thread with missing ID', function (done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'Invalid ID')
            done()
          })
      })
    })
  })

  suite('API ROUTING FOR /api/replies/:board', function () {
    suite('POST', function () {
      test('POST reply', function (done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id: testThID, delete_password: testPass, text: rText})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(err, null)
            expect(res).to.redirect
            done()
          })
      })
      test('POST reply with missing thread ID', function (done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({delete_password: testPass, text: rText})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.text, 'Invalid ID', 'show error for missing ID')
            done()
          })
      })
      test('POST reply with missing password', function (done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id: testThID, text: rText})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.text, 'need a password', 'show error for missing password')
            done()
          })
      })
    })

    suite('GET', function () {
      test('Get thread and replies', function (done) {
        chai.request(server)
          .get('/api/replies/test')
          .send({thread_id: testThID})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.property(res.body, 'created_on', 'Thread has created date')
            assert.property(res.body, 'bumped_on', 'Thread has a bumped date')
            assert.property(res.body, 'board', 'Thread has a date created date')
            assert.property(res.body, 'text', 'Thread has text')
            assert.notProperty(res.body, 'delete_password', 'Does not return password')
            assert.isAbove(res.body.replies.length, 0, 'Response contains replies')
            assert.property(res.body.replies[0], 'text', 'Reply has text')
            assert.property(res.body.replies[0], 'created_on', 'Reply has a created date')
            testReID = res.body.replies[0]._id
            done()
          })
      })
      test('Get thread and replies with missing ID', function (done) {
        chai.request(server)
          .get('/api/replies/test')
          .send({thread_id: null})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'Invalid ID', 'show error for missing ID')
            done()
          })
      })
    })

    suite('PUT', function () {
      test('Report Thread', function (done) {
        chai.request(server)
          .put('/api/replies/test')
          .send({thread_id: testThID, reply_id: testReID})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'success')
            done()
          })
      })
      test('Report Thread with missing reply ID', function (done) {
        chai.request(server)
          .put('/api/replies/test')
          .send({thread_id: testThID, reply_id: null})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'Reply not found', 'Show error for missing reply')
            done()
          })
      })
    })

    suite('DELETE', function () {
      test('delete reply with invalid ID', function (done) {
        chai.request(server)
          .delete('/api/replies/test')
          .send({thread_id: testThID, delete_password: testPass, reply_id: 'awdawdawd'})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'Invalid Reply ID', 'Error for invalid ID')
            done()
          })
      })
      test('delete reply with invalid password', function (done) {
        chai.request(server)
          .delete('/api/replies/test')
          .send({thread_id: testThID, delete_password: 'wrongpass', reply_id: testReID})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'incorrect password', 'Error for wrong password')
            done()
          })
      })
      test('delete reply', function (done) {
        chai.request(server)
          .delete('/api/replies/test')
          .send({thread_id: testThID, delete_password: testPass, reply_id: testReID})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'success')
            done()
          })
      })

      test('delete thread with invalid password', function (done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: testThID, delete_password: 'bad pass'})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'incorrect password', 'Error for bad password')
            done()
          })
      })
      test('delete thread with invalid ID', function (done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: 'badid', delete_password: testPass})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'Invalid ID', 'Error for Invalid ID')
            done()
          })
      })
      test('delete thread', function (done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: testThID, delete_password: testPass})
          .end(function (err, res) {
            if (err) return console.log(err)
            assert.equal(res.status, 200, 'Server response')
            assert.equal(res.text, 'success')
            done()
          })
      })
    })
  })
})
