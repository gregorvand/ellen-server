const jwt = require('jsonwebtoken')
const User = require('../models').User

module.exports = {
  async currentUser(token) {
    console.log('token...', token)
    const decoded = jwt.verify(token, process.env.USER_AUTH_SECRET)
    const user = await User.findOne({
      where: { email: decoded.user.email },
    })
    return user
  },
}
