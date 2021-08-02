const Order = require('../models').Order
const Company = require('../models').Company

const insertOrderRow = async function (...edisonRow) {
  const edisonData = edisonRow[0]

  // check if existing co, if not, add record and get ID

  let companyId = false
  let newCompany = false
  const isACompany = await Company.findOne({
    where: {
      emailIdentifier: edisonData.from_domain,
    },
  })

  if (isACompany.id !== null) {
    companyId = isACompany.id
  } else {
    console.log('got to new company..')
    newCompany = await Company.create({
      nameIdentifier: edisonData.item_reseller,
      emailIdentifier: edisonData.from_domain,
      orderPrefix: '#',
      companyType: 'private',
    }).then((newCompany) => newCompany)
  }

  newCompany ? (companyId = newCompany.id) : companyId

  console.log('id is..', companyId)

  return Order.create({
    orderNumber: BigInt(edisonData.order_number),
    fromEmail: edisonData.from_domain,
    customerEmail: edisonData.user_id,
    plainContent: 'not available',
    // totalValue:
    //   edisonData.order_total_amount == '' ? 0 : edisonData.order_total_amount, // run decimal migration
    totalValue: 0,
    companyId: companyId,
    orderDate: edisonData.email_time,
  })
    .then((company) => console.log(company.toJSON()))
    .catch((error) => console.error(error))
}

module.exports = {
  insertOrderRow: insertOrderRow,
}
