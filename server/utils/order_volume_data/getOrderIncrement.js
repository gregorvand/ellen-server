// Params: Orders as per Order model
const dayjs = require('dayjs')
const { removeDuplicates } = require('../helpers')

function getOrderDifferenceIncrement(orders) {
  // discard any duplcates based on data

  // first map T value just to a date without time
  const flattenedTimes = orders.map((order) => ({
    t: dayjs(order.dataValues.t).startOf('day').toISOString(),
    y: order.dataValues.y,
  }))

  const flattenedTimesNoDuplicates = removeDuplicates(flattenedTimes, 't')
  console.log(flattenedTimesNoDuplicates)
  console.log(flattenedTimesNoDuplicates.length)
  console.log('reduced from', flattenedTimes.length)

  const orderData = flattenedTimesNoDuplicates
  // console.log(orderData);
  totalDataPoints = orderData.length
  let newData = new Array()
  orderData.forEach((order, index) => {
    if (index !== 0) {
      // get timestamp difference first and store as a day value, divide by no. of days between

      // if date1 and date2 are the same, remove the last loop's data, get
      const date1 = dayjs(orderData[index - 1].t)
      const date2 = dayjs(order.t)
      const dayDifference = date2.diff(date1, 'day')

      const avgOrderIncrement = (
        (order.y - orderData[index - 1].y) /
        dayDifference
      ).toFixed(2)

      // if we have two of the same date, discard the higher number (easier solution day one)
      if (!date1.isSame(date2, 'day')) {
        // GOOD DEBUG
        // console.log(
        //   'data stuff',
        //   order.y,
        //   date1,
        //   date2,
        //   dayDifference,
        //   avgOrderIncrement
        // )

        // we shift the 'differece' value to line up with date1 so that
        // avg *starts* at that date
        const backDate = orderData[index - 1].t
        newData.push({ y: avgOrderIncrement, x: backDate }) // changed to 'x' from 't' for chartJS3 support

        // for stepped graph, we then need a final data point
        // that is the final date and a repeat of the avg order value
        // also valid as '  extrapolation' technique for non-stepped
        if (index === totalDataPoints - 1) {
          console.log(avgOrderIncrement)
          newData.push({ y: avgOrderIncrement, x: order.t })
        }
      } else {
        console.log(`yikes we got two of the same!, ignoring ${order.y}`)
      }
    }

    // console.log(newData)
  })

  return newData
}

module.exports = {
  getOrderDifferenceIncrement: getOrderDifferenceIncrement,
}
