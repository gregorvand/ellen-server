const Points = require('../../server/models').Point;
const Order = require('../../server/models').Order;
const Company = require('../../server/models').Company;
const dashboardHelpers = require('../../views/helpers/dashboard_helpers');
const pointsServiceCalculator = require('../../server/services/points/point_calculators');
const Op = require('sequelize').Op;
const constants = require('../../server/utils/constants');


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

  // REFACTOR: POINTS REASONS AND VALUES NEED TO BE IN SAME OBJECT
  // ALSO REFACTOR TO JUST TOTAL UP ALL SUBMISSION POINT VALUES ....
  const reasonOne = 1;
  const pointsByReasonPromise = pointsServiceCalculator.calculatePointsFromReason(req.user.id, reasonOne).then(returnedPointsCount => {
    pointsCount = parseInt(returnedPointsCount) * parseInt(constants.POINTS[0]['value']);
  })

  const totalAllPointsPromise = pointsServiceCalculator.calculateAllPointsWithTimeframe(req.user.id).then(returnedTotal => {
    console.log('yep', returnedTotal),
    totalPoints = returnedTotal
  })
  
  Promise.all([ordersByCompanyPromise, latestEmailsPromise, pointsByUserPromise, pointsByReasonPromise, totalAllPointsPromise]).then(() => {
    res.render("dashboard", { 
      user: req.user,
      points: userPoints,
      pointsCount: pointsCount,
      totalPoints: totalPoints,
      orders: userOrders,
      emails: userEmails,
      helpers: dashboardHelpers
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