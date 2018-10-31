const bcrypt = require('bcrypt')
const thread = require('../models/thread')
const mongoose = require('mongoose')
// const async = require('async')

exports.getThread = function (req, res, next) {
  if (!req.params.board || typeof req.params.board !== 'string') return res.send('board not found')
  thread.find({board: req.params.board})
    .sort({bumped_on: 'desc'})
    .limit(10)
    .exec()
    .then((result) => {
      let docs = result.map((el) => {
        let recReplies = el.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3)
        let hiddenCount = el.replies.length - 3
        if (hiddenCount < 1) { hiddenCount = 0 }
        recReplies = recReplies.map(el => (
          {_id: el._id,
            created_on: el.created_on,
            thread_id: el.thread_id,
            text: el.text})
        )
        return {
          _id: el._id,
          created_on: el.created_on,
          bumped_on: el.bumped_on,
          board: el.board,
          text: el.text,
          hiddenCount,
          replies: recReplies}
      })
      return res.json(docs)
    })
    .catch(error => console.error(error))
}

exports.getReplies = function (req, res, next) {
  let thread_id = req.query.thread_id || req.body.thread_id
  if (!mongoose.Types.ObjectId.isValid(thread_id)) return res.send('Invalid ID')
  thread.findById(thread_id).exec()
    .then((doc) => {
      if (!doc) return res.send('Thread not found')
      let replies = doc.replies.map(el => (
        {_id: el._id,
          created_on: el.created_on,
          thread_id: el.thread_id,
          text: el.text})
      )
      let thr = {
        _id: doc._id,
        created_on: doc.created_on,
        bumped_on: doc.bumped_on,
        board: doc.board,
        text: doc.text,
        replies}
      res.json(thr)
    })
    .catch(error => console.error(error))
}

exports.postThread = function (req, res, next) {
  if (!req.body.delete_password) return res.send('need a password')
  bcrypt.hash(req.body.delete_password, Number(process.env.SALT_ROUNDS))
    .then((hash) => {
      let nThread = req.body
      nThread.delete_password = hash
      let newThread = thread(nThread)
      if (!newThread.board) newThread.board = req.params.board
      newThread.board = newThread.board.toLowerCase()
      newThread.save((err, doc) => {
        if (err) return console.error(err)
        return res.redirect(`/b/${doc.board}?id=${doc._id}`)
      })
    })
    .catch(error => console.error(error))
}

exports.postReplies = function (req, res, next) {
  let board = null
  if (!mongoose.Types.ObjectId.isValid(req.body.thread_id)) return res.send('Invalid ID')
  if (!req.body.delete_password) return res.send('need a password')
  thread.findById(req.body.thread_id).exec()
    .then((doc) => {
      if (!doc) return res.send('Thread not found')
      board = doc.board
      return bcrypt.hash(req.body.delete_password, Number(process.env.SALT_ROUNDS))
    })
    .then((hash) => {
      let nReply = req.body
      nReply.delete_password = hash
      nReply.created_on = new Date()
      delete nReply.board
      thread.findByIdAndUpdate(req.body.thread_id, {$push: {replies: nReply},
        bumped_on: new Date()}, {new: true}).exec()
    })
    .then((doc) => {
      return res.redirect(`/b/${board}/${req.body.thread_id}`)
    })
    .catch(error => console.error(error))
}

exports.deleteThread = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.body.thread_id)) return res.send('Invalid ID')
  thread.findById(req.body.thread_id).exec()
    .then((doc) => {
      if (!doc) {
        res.send('Thread not found')
        return Promise.reject(new Error('Thread not found'))
      }
      return doc
    })
    .then((doc) => {
      bcrypt.compare(req.body.delete_password, doc.delete_password)
        .then((pwCheck) => {
          if (!pwCheck) {
            res.send('incorrect password')
            return Promise.reject(new Error('incorrect password'))
          }
          return Promise.resolve()
        })
        .then(() => {
          doc.remove()
            .then(() => {
              return res.send('success')
            })
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    })
    .catch(error => console.error(error))
}
exports.deleteReply = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.body.thread_id)) return res.send('Invalid Thread ID')
  if (!mongoose.Types.ObjectId.isValid(req.body.reply_id)) return res.send('Invalid Reply ID')
  thread.findById(req.body.thread_id).exec()
    .then((doc) => {
      if (!doc) {
        res.send('Thread not found')
        return Promise.reject(new Error('Thread not found'))
      }
      return doc
    })
    .then((doc) => {
      let repl = doc.replies.id(req.body.reply_id)
      if (!repl) {
        res.send('Reply not found')
        return Promise.reject(new Error('Reply not found'))
      }
      bcrypt.compare(req.body.delete_password, repl.delete_password)
        .then((pwCheck) => {
          if (!pwCheck) {
            res.send('incorrect password')
            return Promise.reject(new Error('incorrect password'))
          }
          repl.remove()
          doc.save()
            .then(() => res.send('success'))
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    })
    .catch(error => console.error(error))
}

exports.reportThread = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.body.thread_id)) return res.send('Invalid ID')
  thread.findById(req.body.thread_id).exec()
    .then((doc) => {
      if (!doc) {
        res.send('Thread not found')
        return Promise.reject(new Error('Thread not found'))
      }
      doc.reported = true
      doc.save()
        .then(() => (res.send('success')))
        .catch(error => console.error(error))
    })
    .catch(error => console.error(error))
}
exports.reportReply = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.body.thread_id)) return res.send('Invalid thread ID')

  thread.findById(req.body.thread_id).exec()
    .then((doc) => {
      if (!doc) {
        res.send('Thread not found')
        return Promise.reject(new Error('Thread not found'))
      }
      let repl = doc.replies.id(req.body.reply_id)
      if (!repl) {
        res.send('Reply not found')
        return Promise.reject(new Error('Reply not found'))
      }
      repl.reported = true
      doc.save()
        .then(() => (res.send('success')))
        .catch(error => console.error(error))
    })
    .catch(error => console.error(error))
}
