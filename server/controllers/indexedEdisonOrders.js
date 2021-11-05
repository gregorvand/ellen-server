const db = require('../models/index')
const dayjs = require('dayjs')

const insertEdisonRowIndexed = async function (edisonRow) {
  const edisonData = edisonRow.dataValues
  const { orderNumber, emailDate, fromDomain } = edisonData

  // console.log(dayjs(emailDate).toISOString())
  const dbDate = dayjs(emailDate).toISOString()

  const createdRecord = await db.sequelize.query(
    `INSERT INTO public."IndexedEdisonOrders" (
      "orderNumber", "emailDate", "fromDomain",
    "createdAt", "updatedAt"
  ) VALUES (
      '${orderNumber}', '${dbDate}', '${fromDomain}',
      NOW(), NOW()
  ) 
  ON CONFLICT ("orderNumber", "fromDomain") DO UPDATE SET
      "emailDate"=excluded."emailDate"
  WHERE excluded."emailDate" < "IndexedEdisonOrders"."emailDate"`
  )

  return createdRecord
}

module.exports = {
  insertEdisonRowIndexed: insertEdisonRowIndexed,
}
