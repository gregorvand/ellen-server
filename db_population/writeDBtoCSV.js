const { parse } = require('json2csv')
const db = require('../server/models/index')

const { createWriteStream } = require('fs')

db.sequelize
  .query(`SELECT * FROM public.aov_indexed_companies`)
  .then((result) => {
    // console.log(result[0])
    const csv = parse(result[0]) // first item is an array of data objects
    createWriteStream(
      `../../ellen_data_exports/aov_indexed_by_month.csv`
    ).write(csv)
  })
