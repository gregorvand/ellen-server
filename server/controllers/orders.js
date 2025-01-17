const Order = require('../models').Order
const Company = require('../models').Company

const DatasetAccess = require('../controllers/datasetAccess')
const pointsController = require('../controllers/points')
const { Op } = require('sequelize')
const pointsTransactionQueue =
  require('../services/bull-queues').pointsTransactionQueue
const pointsHelper = require('../utils/getPointValues')
const Sentry = require('@sentry/node')
const db = require('../models/index')
const dayjs = require('dayjs')

const userHelpers = require('../utils/getUserFromToken')
const dataUtilties = require('../utils/dateIdentifier.js')

const {
  getOrders,
  getOrdersByMonth,
} = require('../utils/order_volume_data/getOrdersForChart')
const getOrderDifferenceIncrement =
  require('../utils/order_volume_data/getOrderIncrement').getOrderDifferenceIncrement

module.exports = {
  create(req, res, orderNumber) {
    return Order.create({
      orderNumber: orderNumber || req.body.number || 1,
      orderDate: req.body.date || Date.now(),
      fromEmail: req.body.fromEmail || 'shop@sendertest.com',
      customerEmail: req.body.customerEmail || 'gregor@vand.hk',
      plainContent: req.body.content || 'Hello this is the email stuff!',
      companyId: req.body.companyId || 1,
    })
      .then((company) => res.status(201).send(company))
      .catch((error) => res.status(400).send(error))
  },

  internalCreate(
    req = false,
    orderNumber,
    fromEmail,
    companyId,
    customerEmail,
    customerId,
    subject,
    emailPlainContent
  ) {
    console.log(customerEmail)
    // what about customer identifer to find customer?

    try {
      return Order.create({
        orderNumber: orderNumber || req.body.number,
        orderDate: orderDate || null,
        fromEmail: fromEmail || 'notfound@ellen.me',
        customerEmail: req.body.customerEmail || customerEmail,
        plainContent: req.body.content || emailPlainContent,
        companyId: companyId || 1,
        customerId: customerId || 1,
        subjectLine: subject,
      })
        .then((order) => {
          const pointsActivated = order.orderNumber === '1' ? false : true
          const reasonNumber = 1
          const pointsToAward =
            pointsHelper.returnPointValueByReason(reasonNumber)
          pointsController.internalCreate(
            pointsToAward,
            customerId,
            pointsActivated,
            reasonNumber,
            order.id
          )
          afterOrderUpdateTasks(order)
        }) // also call Points add with true/false activate flag on order number value
        .catch((error) => {
          Sentry.captureException(error)
        })
    } catch (e) {
      Sentry.setUser({ email: customerEmail })
      Sentry.captureException(e)
    }
  },

  async listByCompany(req, res) {
    if (req.body.companyId) {
      // get orders formatted as needed for the next bit
      const lookbackMonths = req.body.lookbackMonths
        ? req.body.lookbackMonths
        : false
      const allOrderData = await getOrders(req.body.companyId, lookbackMonths)

      // now get all the avg data
      const data = getOrderDifferenceIncrement(allOrderData)
      res.send(data)
    } else {
      res.send('could not find company by Id').status(400)
    }
  },

  // Returns the data for a given company
  // Checks user's subcriptions first
  // If granted
  async companyDataByMonth(req, res) {
    const { companyId, dateStart, dateEnd } = req.body

    const month = dayjs(dateStart).get('month')
    const year = dayjs(dateStart).get('year')
    const dataIdToCheck = dataUtilties.constructDateIdentifier(
      companyId,
      month,
      year
    )
    const currentUser = await userHelpers.currentUser(req.token)
    console.log(currentUser.id)
    console.log(dataIdToCheck)

    const accessGranted = await DatasetAccess.getAccessCheck(
      currentUser.id,
      dataIdToCheck
    )

    if (accessGranted) {
      if (req.body.companyId) {
        const allOrderData = await getOrdersByMonth(
          req.body.companyId,
          req.body.dateStart,
          req.body.dateEnd
        )

        // now get all the avg data
        const data = getOrderDifferenceIncrement(allOrderData)
        let total = 0
        const { removeDuplicates } = require('../utils/helpers')

        let filteredData = removeDuplicates(data, 'y')
        parseNegative = filteredData.filter((data) => {
          if (parseInt(data.y) > 0) {
            return data
          }
        })

        filteredData = parseNegative.map((dataPoint) => {
          total += parseInt(dataPoint.y)
        })
        const monthAvg = [
          { y: parseInt(total / filteredData.length), x: req.body.dateEnd },
        ]
        res.send({ daily: data, monthly: monthAvg })
      } else {
        res.send('could not find company by Id').status(400)
      }
    } else {
      // not authorized, ie user does not have access to this dataset
      res.sendStatus(401)
    }
  },

  listByCustomerEmail(req, res) {
    if (req.body.email) {
      return Order.findAll({
        where: {
          customerEmail: req.body.email,
        },
        include: Company,
      })
        .then((companies) => res.status(200).send(companies))
        .catch((error) => res.status(400).send(error))
    } else {
      return Order.findAll({
        include: Company,
      })
        .then((companies) => res.status(200).send(companies))
        .catch((error) => res.status(400).send(error))
    }
  },

  listByCustomer(req, res) {
    return Order.findAll({
      where: {
        customerId: req.params.userId,
      },
      include: [
        {
          model: Company,
          attributes: ['nameIdentifier'],
        },
      ],
      order: [[Company, 'nameIdentifier', 'ASC']],
      raw: true,
    })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error))
  },

  update(req, res) {
    return Order.findByPk(req.params.id)
      .then((order) => {
        if (!order) {
          return res.status(404).send({
            message: 'Order record Not Found',
          })
        }
        return order
          .update(
            {
              orderNumber: req.body.orderNumber || 1,
            },
            {
              returning: true,
              plain: true,
              logging: false,
            }
          )
          .then((order) => {
            afterOrderUpdateTasks(order)
          })
          .then(() => res.status(200).send('updated yow!'))
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  // pass in company, year
  // get the months from that year that have data
  // constructed with help via https://stackoverflow.com/questions/69127003/mixing-distinct-with-group-by-postgres
  async monthsAvailableByYear(req, res) {
    const company = await Company.findOne({ where: { id: req.body.companyId } })
    const [results] = await db.sequelize.query(
      `SELECT
          DATE_PART('month', "emailDate") AS month,
          COUNT(DISTINCT "emailDate"::date) AS count
      FROM "EdisonOrders"
      WHERE
        "orderNumber" ~ '^\\d+$' AND
        "fromDomain" = '${company.emailIdentifier}' AND
        DATE_PART('year', "emailDate") = '${req.body.year}'
      GROUP BY
        DATE_PART('month', "emailDate")
      HAVING
        COUNT(DISTINCT DATE_PART('day', "emailDate")) > 3;`
    )
    res.send(results).status(200)
  },
}

async function afterOrderUpdateTasks(updatedOrder) {
  const orderData = updatedOrder.dataValues

  // AFTER UPDATE
  // 1 check if order now valid and
  // validate (or not) all points transactions associated
  pointsController.validateAllPointsTransactionsForOrder(
    orderData.id,
    orderData.orderNumber !== '1'
  )

  // 2 check if order is the first now valid order
  // checkFirstOrderForCompany(orderData.id);
  // and then
  // 4 upsert a 'first email' bonus if it is now the first valid  (ie check for reason2 point)
  upsertFirstOrderPoints(orderData)

  // pointsTransationQueue.add({
  //   foo: 'bar'
  // });

  // REPEAT EXAMPLE - RUN EVERY ONE MINUTE
  // pointsTransationQueue.add({
  //   foo: 'bar3'
  // }, { repeat: { cron: '*/1 * * * *' } });
}

async function checkFirstOrderForCompany(orderId) {
  // lookup order in DB
  return Order.findByPk(orderId).then((order) => {
    // lookup all orders with this company
    return Order.findAll({
      where: {
        companyId: order.companyId,
        orderNumber: { [Op.not]: 1 },
      },
      order: [['createdAt', 'ASC']],
    }).then((allOrders) => {
      return orderId === allOrders[0]?.id
    })
  })
}

async function upsertFirstOrderPoints(orderData) {
  // check if first [valid]Order for that Company, award bonus if so
  const reasonNumber = 2
  const pointsToAward = pointsHelper.returnPointValueByReason(reasonNumber)
  const isFirstForThisCompany =
    (await checkFirstOrderForCompany(orderData.id)) || false
  if (isFirstForThisCompany) {
    pointsTransactionQueue.add(
      pointsController.upsert(
        pointsToAward,
        orderData.customerId,
        true,
        reasonNumber,
        orderData.id
      )
    )
  }
}
