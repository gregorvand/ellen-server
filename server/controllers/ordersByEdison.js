const Order = require('../models').Order

const insertEdisonRow = async function (companyId, ...edisonRow) {
  const edisonData = edisonRow[0]
  const orderNumberIdentifier = edisonData.order_number
  if (typeof edisonData.order_number == 'number') {
    const isAnOrder = await Order.count({
      where: {
        orderNumber: parseInt(orderNumberIdentifier),
      },
    })

    if (isAnOrder < 1) {
      // console.log(`inserting ${orderNumberIdentifier}`)
      await Order.create({
        orderNumber: parseInt(orderNumberIdentifier),
        fromEmail: edisonData.from_domain,
        customerEmail: edisonData.user_id,
        plainContent: 'not available',
        totalValue:
          edisonData.order_total_amount == ''
            ? 0
            : edisonData.order_total_amount, // run decimal migration
        companyId: companyId,
        orderDate: edisonData.email_time,
      })
    } else {
      console.log('already had order', orderNumberIdentifier)
    }
  } else {
    console.log('invalid order number', orderNumberIdentifier)
  }
}

const insertEdisonRowNoId = async function (...edisonRow) {
  const edisonData = edisonRow[0]
  const orderNumberIdentifier = edisonData.order_number
  let sanitizedOrderNumber =
    typeof orderNumberIdentifier == 'string' && orderNumberIdentifier.length > 1
      ? parseInt(orderNumberIdentifier.replace(/[^\d.-]/g, ''))
      : orderNumberIdentifier

  if (
    typeof sanitizedOrderNumber == 'number' &&
    sanitizedOrderNumber !== '' &&
    sanitizedOrderNumber > 0
  ) {
    return await Order.create({
      orderNumber: parseInt(sanitizedOrderNumber),
      fromEmail: edisonData.from_domain,
      customerEmail: edisonData.user_id,
      plainContent: 'not available',
      totalValue:
        edisonData.order_total_amount == '' ? 0 : edisonData.order_total_amount, // run decimal migration
      companyId: 2,
      orderDate: edisonData.email_time,
    })
  } else {
    // console.log('invalid order number', orderNumberIdentifier)
  }
}

module.exports = {
  insertEdisonRow: insertEdisonRow,
  insertEdisonRowNoId: insertEdisonRowNoId,
}
