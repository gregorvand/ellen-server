const Points = require('../../server/models').Point
const Order = require('../../server/models').Order

const dashboardHelpers = require('../../views/helpers/dashboard_helpers')
const rankedUserHelpers = require('../../views/helpers/ranked_user_helper')

const pointsServiceCalculator = require('../../server/services/points/point_calculators')
const constantsArray = require('../../server/utils/constants')

const renderDashboardv2 = function (req, res, view = 'dashboardv2') {
  const pointsByUserPromise = getPointsByUser(req.user.id).then(
    (returnedPoints) => {
      userPoints = returnedPoints
    }
  )

  const totalAllPointsPromise = pointsServiceCalculator
    .calculateAllPoints(req.user.id)
    .then((returnedTotal) => {
      totalPoints = returnedTotal
    })

  const rankedUserPromise = rankedUserHelpers
    .renderRankedUsers(req, res)
    .then((returnedList) => {
      rankedList = returnedList
    })

  const latestEmailsPromise = getLatestEmails(req.user.id).then(
    (latestEmails) => {
      userEmails = latestEmails
    }
  )

  Promise.all([
    pointsByUserPromise,
    totalAllPointsPromise,
    rankedUserPromise,
    latestEmailsPromise,
  ]).then(() => {
    res.render(view, {
      user: req.user,
      points: userPoints,
      totalPoints: totalPoints,
      helpers: dashboardHelpers,
      rankedUserList: rankedList,
      emails: userEmails,
      reasons: constantsArray.POINTS,
      prizes: constantsArray.DAILY_PRIZES,
    })
  })
}

function getPointsByUser(id) {
  return Points.findAll({
    where: {
      customerId: id,
    },
    limit: 6,
    order: [['createdAt', 'DESC']],
  })
}

function getLatestEmails(id) {
  return Order.findAll({
    where: {
      customerId: id,
    },
    include: 'points',
    limit: 10,
    order: [['createdAt', 'DESC']],
  })
}

module.exports.renderDashboardv2 = renderDashboardv2
