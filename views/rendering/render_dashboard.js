const Points = require('../../server/models').Point;
const Order = require('../../server/models').Order;
const Company = require('../../server/models').Company;
const dashboardHelpers = require('../../views/helpers/dashboard_helpers');
const Op = require('sequelize').Op;


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
  
  Promise.all([ordersByCompanyPromise, latestEmailsPromise, pointsByUserPromise]).then(() => {
    res.render("dashboard", { 
      user: req.user,
      points: userPoints,
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