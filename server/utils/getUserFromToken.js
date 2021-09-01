module.exports = {
  async currentUser() {
    const decoded = jwt.verify(req.token, process.env.USER_AUTH_SECRET)
    const currentUser = await User.findOne({
      where: { email: decoded.user.email },
    })
    return currentUser
  },
}
