require('dotenv').config()
const { createWriteStream } = require('fs')
const { textDate } = require('../server/utils/getToday')

const today = textDate()

const { parse } = require('json2csv')
const IndexedCompany = require('../server/models').IndexedCompany

// Gets a list of all indexed companies and convert / write to local CSV file
async function getAndConvertCompaniesToCSV() {
  const allCompanies = await IndexedCompany.findAll()

  let flattened = allCompanies.map((company) => {
    return company.dataValues
  })

  let fileAppend = process.env.NODE_ENV == 'production' ? '_prod' : '_local'
  const csv = parse(flattened)
  createWriteStream(
    `../../ellen_db_dumps/indexedCompanies_${today}${fileAppend}.csv`
  ).write(csv)
}

getAndConvertCompaniesToCSV()
