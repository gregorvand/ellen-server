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
  
  Promise.all([ordersByCompanyPromise, latestEmailsPromise]).then(() => {
    res.render("dashboard", { 
      user: req.user,
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

module.exports.renderDashboard = renderDashboard;