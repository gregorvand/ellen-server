// returns a list of unique values per a specified key index for an array of objects.
// assumes all objects have the same keys

require('dotenv').config()
const data = require('./data/fmp_07072021_NASDAQ_ellen_import.json')

const distinctItems = [
  ...new Map(data.map((item) => [item['sector'], item])).values(),
]

distinctItems.forEach((company) => {
  console.log(company.sector)
})
