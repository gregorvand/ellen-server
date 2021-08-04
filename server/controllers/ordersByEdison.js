const Order = require('../models').Order

const insertEdisonRow = async function (companyId, ...edisonRow) {
  const edisonData = edisonRow[0]

  const isAnOrder = await Order.count({
    where: {
      orderNumber: BigInt(edisonData.order_number),
    },
  })

  console.log('is already added?', isAnOrder)

  if (isAnOrder < 1) {
    await Order.create({
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
  } else {
    console.log('already had', edisonData.order_number)
  }
}

module.exports = {
  insertEdisonRow: insertEdisonRow,
}
