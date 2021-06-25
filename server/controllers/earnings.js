const jwt = require('jsonwebtoken')
const axios = require('axios')
module.exports = {
  getYesterdayEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        axios({
          method: 'get',
          url: `https://finnhub.io/api/v1/calendar/earnings?from=2021-06-24&to=2021-06-24&token=c38tm4iad3ido5aka4e0`,
        }).then(({ data }) => {
          res.send(data)
        })
      }
    })
  },
}
