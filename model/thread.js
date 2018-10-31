const mongoose = require('mongoose')
const Schema = mongoose.Schema

let replySchema = new Schema({
  thread_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true},
  text: {type: String, required: true},
  created_on: {type: Date, required: true},
  delete_password: {type: String, required: true},
  reported: {type: Boolean, default: false}
})

let threadSchema = new Schema({
  text: {type: String, required: true},
  board: {type: String, required: true},
  created_on: {type: Date, default: new Date()},
  bumped_on: {type: Date, default: new Date()},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: [replySchema]
})

module.exports = mongoose.model('threads', threadSchema)
