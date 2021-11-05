const EdisonOrderIndexed = require('../models').EdisonOrderIndexed
const Company = require('../models').Company
const db = require('../models/index')
const { Op } = require('sequelize')
var _ = require('lodash')

const insertEdisonRowIndexed = async function (...edisonRow) {
  const edisonData = edisonRow[0]
  const { order_number, email_time, from_domain } = edisonData

  const [results] = await db.sequelize.query(
    `INSERT INTO public."EdisonOrderIndexeds" (
      "orderNumber", "emailDate", "fromDomain",
    "createdAt", "updatedAt"
  ) VALUES (
      ${order_number}, ${email_time}, ${from_domain},
      NOW(), NOW()
  ) 
  ON CONFLICT ("orderNumber") DO UPDATE SET
      "emailDate"=excluded."emailDate"
  WHERE excluded."emailDate" < "EdisonOrderIndexeds"."emailDate"`
  )

  // const {
  //   user_id,
  //   order_number,
  //   email_time,
  //   checksum,
  //   item_reseller,
  //   from_domain,
  //   email_subject,
  // } = edisonData
  // try {
  //   return await EdisonOrderIndexed.create({
  //     userId: user_id,
  //     orderNumber: order_number,
  //     emailDate: email_time,
  //     fromDomain: from_domain,
  //     itemReseller: item_reseller,
  //     checksum: checksum,
  //     subjectLine: email_subject,
  //   })
  // } catch (e) {
  //   console.log(`${e} could not add row ${order_number}`)
  // }
}

module.exports = {
  insertEdisonRowIndexed: insertEdisonRowIndexed,
}
