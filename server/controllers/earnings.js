const jwt = require('jsonwebtoken')
const axios = require('axios')
const Yesterday = require('../utils/getYesterday')

module.exports = {
  getYesterdayEarnings(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        const today = new Date()
        const getYesterday = new Yesterday(today).dateYesterday()
        console.log(getYesterday)
        // get yesterday, then convert to exchange timezone.. NYC...
        // const marketYesterday = getYesterday
        //   .tz('America/New_York')
        //   .format('YYYY-MM-DD')

        const marketYesterday = '2021-06-25' // for test purposes if yesterday is non business day

        axios({
          method: 'get',
          url: `https://finnhub.io/api/v1/calendar/earnings?from=${marketYesterday}&to=${marketYesterday}&token=c38tm4iad3ido5aka4e0`,
        }).then(({ data }) => {
          res.send(data)
        })
      }
    })
  },
}
