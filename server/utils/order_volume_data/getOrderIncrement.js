// Params: Orders as per Order model
const dayjs = require('dayjs')
const { removeDuplicates } = require('../helpers')

function getOrderDifferenceIncrement(orders) {
  // discard any duplcates based on data

  // useful debug for unfiltered dates/data
  // console.log('all data considered', orders)
  // first map T value just to a date without time
  const flattenedTimes = orders.map((order) => ({
    t: dayjs(order.t).startOf('day').toISOString(),
    y: order.y,
  }))

  const flattenedTimesNoDuplicates = removeDuplicates(flattenedTimes, 't')
  console.log(flattenedTimesNoDuplicates.length)
  console.log('reduced from', flattenedTimes.length)

  const orderData = flattenedTimesNoDuplicates
  // console.log(orderData);
  totalDataPoints = orderData.length
  let newData = new Array()

  // track increment in case we need to use the last increment (instead of a zero)
  let lastIncrement = 0
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
        console.log(
          'data stuff',
          order.y,
          date1.format('YYYY-MM-DD'),
          date2.format('YYYY-MM-DD'),
          dayDifference,
          avgOrderIncrement
        )

        // we shift the 'differece' value to line up with date1 so that
        // avg *starts* at that date
        const backDate = orderData[index - 1].t

        const normalizedIncrement =
          avgOrderIncrement <= 0 ? lastIncrement : avgOrderIncrement
        newData.push({ y: normalizedIncrement, x: backDate }) // changed to 'x' from 't' for chartJS3 support
        lastIncrement = normalizedIncrement

        // console.log(normalizedIncrement)
        // for stepped graph, we then need a final data point
        // that is the final date and a repeat of the avg order value
        // also valid as ' extrapolation' technique for non-stepped
        if (index === totalDataPoints - 1) {
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

function getOrderDifferenceIncrementV2(orders) {
  let newData = new Array()
  let orderData = orders
  let totalDataPoints = orderData.length

  // track increment in case we need to use the last increment (instead of a zero)
  let lastIncrement = 0
  orderData.forEach((order, index) => {
    if (index !== 0) {
      // get timestamp difference first and store as a day value, divide by no. of days between

      // if date1 and date2 are the same, remove the last loop's data, get
      const date1 = dayjs(orderData[index - 1].x)
      const date2 = dayjs(order.t)
      const dayDifference = date2.diff(date1, 'day')

      const avgOrderIncrement = (
        (order.y - orderData[index - 1].y) /
        dayDifference
      ).toFixed(2)

      // if we have two of the same date, discard the higher number (easier solution day one)
      if (!date1.isSame(date2, 'day')) {
        // GOOD DEBUG
        console.log(
          'data stuff',
          order.y,
          date1.format('YYYY-MM-DD'),
          date2.format('YYYY-MM-DD'),
          dayDifference,
          avgOrderIncrement
        )

        // we shift the 'differece' value to line up with date1 so that
        // avg *starts* at that date
        const backDate = orderData[index - 1].x

        const normalizedIncrement =
          avgOrderIncrement <= 0 ? lastIncrement : avgOrderIncrement
        newData.push({ y: normalizedIncrement, x: backDate }) // changed to 'x' from 't' for chartJS3 support
        lastIncrement = normalizedIncrement

        // console.log(normalizedIncrement)
        // for stepped graph, we then need a final data point
        // that is the final date and a repeat of the avg order value
        // also valid as ' extrapolation' technique for non-stepped
        if (index === totalDataPoints - 1) {
          newData.push({ y: avgOrderIncrement, x: order.x })
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
  getOrderDifferenceIncrementV2: getOrderDifferenceIncrementV2,
}
