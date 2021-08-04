const Order = require('../models').Order

const insertEdisonRow = async function (companyId, ...edisonRow) {
  const edisonData = edisonRow[0]
  const orderNumberIdentifier = edisonData.order_number
  if (typeof edisonData.order_number == 'number') {
    console.log(typeof orderNumberIdentifier)
    const isAnOrder = await Order.count({
      where: {
        orderNumber: BigInt(orderNumberIdentifier),
      },
    })

    console.log('is already added?', isAnOrder)

    if (isAnOrder < 1) {
      await Order.create({
        orderNumber: BigInt(orderNumberIdentifier),
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
      console.log('already had', orderNumberIdentifier)
    }
  } else {
    console.log('invalid order number', orderNumberIdentifier)
  }
}

module.exports = {
  insertEdisonRow: insertEdisonRow,
}
