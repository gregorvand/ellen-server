require('dotenv').config()

const { getAndStoreQuarterlyEarnings } = require('./controllers/earnings')

const EarningCalendar = require('./models').EarningCalendar
async function testEarnings() {
  EarningCalendar.findOne({
    where: {
      ticker: 'JCTCF',
    },
  }).then((result) => {
    console.log(result.dataValues.ticker)
    getAndStoreQuarterlyEarnings([result])
  })
}

testEarnings()
