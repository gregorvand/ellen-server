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

const Company = require('../models').Company
var _ = require('lodash')
const userHelpers = require('../utils/getUserFromToken')
const DatasetAccess = require('../controllers/datasetAccess')
const { removeDuplicates, flattenArrayByKey } = require('../utils/helpers')
var objectSupport = require('dayjs/plugin/objectSupport')
dayjs.extend(objectSupport)

const generateCompanyRegex = require('../utils/generateCompanyRegex')

const indexedEdisonOrdersByYear = async function (req, res) {
  // console.log(req)
  const { companyId, year } = req.query
  const dataYear = year
  const company = await Company.findOne({ where: { id: companyId } })

  const { emailIdentifier, orderPrefix } = company

  console.log(`${company.emailIdentifier} ${companyId} ${year}`)
  const [results] = await db.sequelize.query(
    `select
    "orderNumber" "y",
    "emailDate" "t"
  from
    public."IndexedEdisonOrders"
  where
    EXTRACT(YEAR FROM "emailDate") = ${dataYear}
    and "fromDomain" = '${emailIdentifier}'
  order by
    "orderNumber" asc,
    "emailDate"`
  )

  // which months does user have access to for this company?
  const currentUser = await userHelpers.currentUser(req.token)
  // console.log(currentUser.id)

  const accessGranted = await DatasetAccess.userAccessByCompany(
    currentUser.id,
    companyId
  )

  // allMonths is an array of just which dataset access IDs they have
  // for a given company and requested year
  let allMonths = accessGranted
    .filter((access) => {
      const id = access.dataValues.datasetId
      let year = id.slice(-4)
      if (dataYear == year) return id
    })
    .map((filtered) => filtered.datasetId)

  let monthsToOpen = allMonths.map((dataset) => {
    return dataset.substr(-8).substring(0, 2)
  })

  // Use standard regex generator to decide which datapoints to evaluate
  const regex = generateCompanyRegex(orderPrefix)
  let resultsRegex = results.filter((result) => {
    return result.y.match(regex)
  })

  // if regex is not default, then remap these to have removed the orderPrefix
  if (orderPrefix !== '#') {
    resultsRegex = results.map((result) => {
      const removePrefix = result.y.split(orderPrefix)
      return { t: result.t, y: removePrefix[1] }
    })
  }

  // Align dates to same times, to compare, and be able to remove duplicates
  const flattenedTimes = resultsRegex.map((order) => ({
    x: dayjs(order.t).startOf('day').toISOString(),
    y: order.y,
  }))

  // remove duplicate dats based on same day
  const flattenedTimesNoDuplicates = removeDuplicates(flattenedTimes, 'x')

  if (process.env.NODE_ENV === 'dev') {
    console.log(flattenedTimesNoDuplicates)
  }
  // ensure user has access to the given months and return those
  let matchResultsWithAccess = flattenedTimesNoDuplicates.filter((result) => {
    const date = new Date(result.x)
    const month = date.getMonth() + 1
    return monthsToOpen.find((access) => access == month)
  })

  // group increments into an array by month
  var sortedResult = _(matchResultsWithAccess)
    .groupBy((x) => new Date(x.x).getMonth())
    .map((value, key) => ({ x: parseFloat(key) + 1, y: value }))
    .value()

  // find the order totals for a given month
  let meanValuesByMonth = sortedResult.map((dataset, index) => {
    let allData = flattenArrayByKey(dataset.y)

    const firstDataPoint = allData[0]
    const lastDataPoint = allData[allData.length - 1]
    const differentFirstLast = lastDataPoint - firstDataPoint
    let dataDate = dayjs({ year: year, month: dataset.x - 1 })
    const dataDateEnd = dataDate.endOf('month')

    if (process.env.NODE_ENV === 'dev') {
      console.log(firstDataPoint, lastDataPoint)
    }

    return { x: dataDateEnd.format('YYYY-MM-DD'), y: differentFirstLast }
  })

  res
    .send({ company: parseInt(companyId), monthly: meanValuesByMonth })
    .status(200)
}

module.exports = {
  insertEdisonRowIndexed: insertEdisonRowIndexed,
  indexedEdisonOrdersByYear: indexedEdisonOrdersByYear,
}
