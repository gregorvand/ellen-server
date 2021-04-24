const Points = require('../../server/models').Point;
const Order = require('../../server/models').Order;
const Company = require('../../server/models').Company;
const dashboardHelpers = require('../../views/helpers/dashboard_helpers');
const rankedUserHelpers = require('../../views/helpers/ranked_user_helper');
const pointsServiceCalculator = require('../../server/services/points/point_calculators');
const Op = require('sequelize').Op;
const dateObjects = require('../../server/utils/setTimezone'); // timezone adjusted instance


const renderDashboard = function(req, res) {
  const ordersByCompanyPromise = getOrdersByCompany(req.user.id).then(returnedOrders => {
    userOrders = returnedOrders;
  })

  const latestEmailsPromise = getLatestEmails(req.user.id).then(latestEmails => {
    userEmails = latestEmails;
  })

  const pointsByUserPromise = getPointsByUser(req.user.id).then(returnedPoints => {
    userPoints = returnedPoints;
  })

  const date1 = dateObjects.startofTodayBySetTimezone;
  const date2 = dateObjects.endofTodayBySetTimezone;
  
  const pointsTodayPromise = pointsServiceCalculator.calculateAllPointsWithTimeframe(req.user.id, date1, date2).then(returnedPoints => {
    console.log('TOTAL TODAY', returnedPoints);
    pointsToday = returnedPoints;
  });

  const totalAllPointsPromise = pointsServiceCalculator.calculateAllPoints(req.user.id).then(returnedTotal => {
    totalPoints = returnedTotal
  });
  
  const rankedUserPromise = rankedUserHelpers.renderRankedUsers(req, res).then(returnedList => {
    rankedList = returnedList
  });
  

  Promise.all([ordersByCompanyPromise, latestEmailsPromise, pointsByUserPromise, pointsTodayPromise, totalAllPointsPromise, rankedUserPromise]).then(() => {
    res.render("dashboard", { 
      user: req.user,
      points: userPoints,
      pointsCount: pointsToday,
      totalPoints: totalPoints,
      orders: userOrders,
      emails: userEmails,
      helpers: dashboardHelpers,
      rankedUserList: rankedList
    });
  })
}

function getOrdersByCompany (id) {
  console.log('an id is', id);
  return Order
  .findAll({
    where: {
      customerId: id,
      orderNumber: {
        [Op.gt]: 1
      }
    },
    include: [{
      model: Company,
      attributes: ['nameIdentifier', 'id'],
    }],
    order: [ 
      [ 
        Company, 'nameIdentifier', 'ASC' ],
        ['orderDate', 'DESC'],
      ]
  })
};

function getLatestEmails (id) {
  return Order
  .findAll({
    where: {
      customerId: id
    },
    limit: 10,
    order: [ ['createdAt', 'DESC'] ]
  })
};

function getPointsByUser (id) {
  return Points
  .findAll({
    where: {
      customerId: id
    },
    limit: 6,
    order: [ ['createdAt', 'DESC'] ]
  })
};


module.exports.renderDashboard = renderDashboard;