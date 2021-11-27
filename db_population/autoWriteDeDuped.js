const { parse } = require('json2csv')
const db = require('../server/models/index')
const scriptConstants = require('./script_constants')

const fileDateIdentifier = scriptConstants.FILE_DATE_IDENTIFIER
const { createWriteStream } = require('fs')

db.sequelize
  .query(
    `select distinct on (checksum) user_id,order_number,email_time,checksum,from_domain,item_reseller,email_subject from public.edison_receipts_temps order by checksum;`
  )
  .then((result) => {
    // console.log(result[0])
    console.log('got deduped results from db')
    const csv = parse(result[0]) // first item is an array of data objects
    createWriteStream(
      `../../edison_daily_updates/${fileDateIdentifier}_000_deduped.csv`
    ).write(csv)
  })
