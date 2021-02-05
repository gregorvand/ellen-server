const Company = require('../../server/models').Company;
const Order = require('../../server/models').Order;

const renderCompanyPage = function(req, res) {

  const companyPromise = getCompanyForPage(req).then(returnedCompany => {
    currentCompany = returnedCompany;
  })

  const orderPromise = getOrders(req.params.id).then(returnedOrders => {
    //  ordersData = doSomethingToData(returnedOrders);
    ordersData = returnedOrders;
  })

  Promise.all([companyPromise, orderPromise]).then(() => {
    res.render("company", { 
      company: currentCompany,
      orders: ordersData
    });
  })
}


function getCompanyForPage(req, res) {
  return Company
  .findByPk(req.params.id, {
    include: [{
      model: Order,
      as: 'orders',
    }],
  })
    .then((company) => company)
    .catch((error) => console.error('error with company page lookup', error));
}

function getOrders(id) {
  console.log('uuuh', id);
  return Order
  .findAll({
    where: {
      companyId: id
    },
    attributes: [
      ['orderDate', 't'],
      ['orderNumber', 'y'],
    ],
    order: [
      ['orderDate', 'ASC']
    ],
  })
  .then((orders) => orders)
  .catch((error) => console.error('error with company page lookup', error));

};

function doSomethingToData (data) {
  // get initial value
  // calc 

  return data.map(order => order.t = 'woop woop');
};

module.exports.renderCompanyPage = renderCompanyPage;