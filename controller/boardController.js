
exports.board = function (req, res, next) {
  res.sendFile(process.cwd() + '/views/board.html')
}
exports.thread = function (req, res, next) {
  res.sendFile(process.cwd() + '/views/thread.html')
}
