// MIDDLEWARE
// THIS IS A REALLY GOOD EXAMPLE OF EXPORTING A *FUNCTION* (NOT OBJECT)
// USED LIKE:
// const auth = require('../middleware/verifyToken')
// then ... auth.verifyToken (is a function)
module.exports = {
  verifyToken: function (req, res, next) {
    const bearerHeader = req.headers['authorization']

    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      const bearerToken = bearer[1]
      req.token = bearerToken
      next(req, res)
    } else {
      res.sendStatus(401)
    }
  },
}
