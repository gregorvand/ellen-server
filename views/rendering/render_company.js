const Company = require('../../server/models').Company;
const Order = require('../../server/models').Order;
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');

const renderCompanyPage = function(req, res) {

  const companyPromise = getCompanyForPage(req).then(returnedCompany => {
    currentCompany = returnedCompany;
  })

  const orderPromise = getOrders(req.params.id).then(returnedOrders => {
    //  ordersData = doSomethingToData(returnedOrders);
    ordersData = getOrderDifferenceIncrement(returnedOrders);
  })

  Promise.all([companyPromise, orderPromise]).then(() => {
    res.render("company", { 
      company: currentCompany,
      orders: ordersData
    });
  })
}

function getOrderDifferenceIncrement(orders) {
  const orderData = orders.map(order => order.dataValues)
  let newData = new Array;
  orderData.forEach((order, index) => {
    if (index !== 0) {
      // get timestamp difference first and store as a day value, divide 
      const date1 = dayjs(orderData[index-1].t);
      const date2 = dayjs(orderData.t);
      console.log('difference', date2.diff(date1, 'day'));
      const dayDifference = date2.diff(date1, 'day');
      const  avgOrderIncrement = parseInt((order.y - orderData[index-1].y) / dayDifference);
      newData.push({'y': avgOrderIncrement, 't': order.t });
    }
  });

  return newData;
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