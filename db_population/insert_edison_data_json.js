require('dotenv').config()
// const data = require('./fmp_07072021_NASDAQ_ellen_import.json')
const data = require('./EDISON_DATA_SAMPLE_1.json')
const ordersByEdison = require('../server/controllers/ordersByEdison')

data.forEach((edisonRow) => {
  ordersByEdison.insertOrderRow(edisonRow)
})
