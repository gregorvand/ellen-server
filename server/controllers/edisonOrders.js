// Controller related to the EdisonOrder model
// currently we also have 'ordersByEdison' controller which was for Order model

const EdisonOrder = require('../models').EdisonOrder
const Company = require('../models').Company
const db = require('../models/index')
const { Op } = require('sequelize')
var _ = require('lodash')

const insertEdisonRowNoId = async function (...edisonRow) {
  const edisonData = edisonRow[0]

  const {
    user_id,
    order_number,
    email_time,
    checksum,
    item_reseller,
    from_domain,
    email_subject,
  } = edisonData
  try {
    return await EdisonOrder.create({
      userId: user_id,
      orderNumber: order_number,
      emailDate: email_time,
      fromDomain: from_domain,
      itemReseller: item_reseller,
      checksum: checksum,
      subjectLine: email_subject,
    })
  } catch (e) {
    console.log(`${e} could not add row ${order_number}`)
  }
}

const edisonOrdersUniqueOrderNumber = async function (req, res) {
  const [results] = await db.sequelize.query(
    `select distinct on ("orderNumber")
    "orderNumber" "y",
    "emailDate" "t"
    from public."EdisonOrders"
    where "fromDomain" = '${req.body.companyEmail}'
    and "orderNumber" ~ '^\\d+$'
    and "emailDate" between '${req.body.dateStart}'::timestamp and '${req.body.dateEnd}'::timestamp
    order by "orderNumber", "emailDate"`
  )
  res.send(results).status(200)
}

// pass in company, year
// get the months from that year that have data
// constructed with help via https://stackoverflow.com/questions/69127003/mixing-distinct-with-group-by-postgres

const generateCompanyRegex = require('../utils/generateCompanyRegex')
// change below to use EdisonOrdersIndexed???
const monthsAvailableByYear = async function (req, res) {
  const company = await Company.findOne({ where: { id: req.body.companyId } })
  const { emailIdentifier, orderPrefix } = company

  let regex = generateCompanyRegex(orderPrefix)
  const [results] = await db.sequelize.query(
    `SELECT
        DATE_PART('month', "emailDate") AS month,
        COUNT(DISTINCT "emailDate"::date) AS count
    FROM "IndexedEdisonOrders"
    WHERE
      "orderNumber" ~ '${regex}' AND
      "fromDomain" = '${emailIdentifier}' AND
      DATE_PART('year', "emailDate") = '${req.body.year}'
    GROUP BY
      DATE_PART('month', "emailDate")
    HAVING
      COUNT(DISTINCT DATE_PART('day', "emailDate")) > 2;`
  )
  res.send(results).status(200)
}

// const userHelpers = require('../utils/getUserFromToken')
// const DatasetAccess = require('../controllers/datasetAccess')

// const { removeDuplicates, flattenArrayByKey } = require('../utils/helpers')
// const dayjs = require('dayjs')
// var objectSupport = require('dayjs/plugin/objectSupport')
// dayjs.extend(objectSupport)

// const edisonOrdersByYear = async function (req, res) {
//   const { companyId, year } = req.query
//   const dataYear = year
//   const company = await Company.findOne({ where: { id: companyId } })
//   const [results] = await db.sequelize.query(
//     `select
//     distinct on ("orderNumber") "orderNumber" "y",
//     "emailDate" "t"
//   from
//     public."EdisonOrders"
//   where
//     EXTRACT(YEAR FROM "emailDate") = ${dataYear}
//     and "fromDomain" = '${company.emailIdentifier}'
//   order by
//     "orderNumber" asc,
//     "emailDate"`
//   )

//   if (process.env.NODE_ENV === 'dev') {
//     console.log(results)
//   }

//   // which months does user have access to for this company?
//   const currentUser = await userHelpers.currentUser(req.token)
//   // console.log(currentUser.id)

//   const accessGranted = await DatasetAccess.userAccessByCompany(
//     currentUser.id,
//     companyId
//   )

//   // allMonths is an array of just which dataset access IDs they have
//   // for a given company and requested year
//   let allMonths = accessGranted
//     .filter((access) => {
//       const id = access.dataValues.datasetId
//       let year = id.slice(-4)
//       if (dataYear == year) return id
//     })
//     .map((filtered) => filtered.datasetId)

//   let monthsToOpen = allMonths.map((dataset) => {
//     return dataset.substr(-8).substring(0, 2)
//   })

//   const regex = `^\\d+$`
//   let resultsRegex = results.filter((result) => {
//     return result.y.match(regex)
//   })

//   // Align dates to same times, to compare, and be able to remove duplicates
//   const flattenedTimes = resultsRegex.map((order) => ({
//     x: dayjs(order.t).startOf('day').toISOString(),
//     y: order.y,
//   }))

//   // remove duplicate dats based on same day
//   const flattenedTimesNoDuplicates = removeDuplicates(flattenedTimes, 'x')

//   // ensure user has access to the given months and return those
//   let matchResultsWithAccess = flattenedTimesNoDuplicates.filter((result) => {
//     const date = new Date(result.x)
//     const month = date.getMonth() + 1
//     return monthsToOpen.find((access) => access == month)
//   })

//   // TODO: get order **increcements**
//   // const incrementDataSet = getOrderDifferenceIncrementV2(matchResultsWithAccess)
//   // console.log(incrementDataSet)
//   // to get mean of avg daily: sort by date, then map using
//   // let allData = flattenArrayByKey(dataset.y)
//   // let theMean = _.mean(allData)

//   // group increments into an array by month
//   var sortedResult = _(matchResultsWithAccess)
//     .groupBy((x) => new Date(x.x).getMonth())
//     .map((value, key) => ({ x: parseFloat(key) + 1, y: value }))
//     .value()

//   // find the mean of all months
//   let meanValuesByMonth = sortedResult.map((dataset, index) => {
//     let allData = flattenArrayByKey(dataset.y)

//     const firstDataPoint = allData[0]
//     const lastDataPoint = allData[allData.length - 1]
//     const differentFirstLast = lastDataPoint - firstDataPoint

//     let dataDate = dayjs({ year: year, month: dataset.x - 1 })
//     return { x: dataDate.format('YYYY-MM'), y: differentFirstLast }
//   })

//   res
//     .send({ company: parseInt(companyId), monthly: meanValuesByMonth })
//     .status(200)
// }

module.exports = {
  insertEdisonRowNoId: insertEdisonRowNoId,
  edisonOrdersUniqueOrderNumber: edisonOrdersUniqueOrderNumber,
  monthsAvailableByYear: monthsAvailableByYear,
  // edisonOrdersByYear: edisonOrdersByYear,
}
