const Company = require('../../server/models').Company;
const Order = require('../../server/models').Order;
const dayjs = require('dayjs');
const companyHelpers = require('../../views/helpers/company_helpers');


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
      orders: ordersData,
      helpers: companyHelpers
    });
  })
}

function getOrderDifferenceIncrement(orders) {
  const orderData = orders.map(order => order.dataValues)
  totalDataPoints = orderData.length;
  let newData = new Array;
  orderData.forEach((order, index) => {
    if (index !== 0) {
      // get timestamp difference first and store as a day value, divide by no. of days between
      const date1 = dayjs(orderData[index-1].t);
      const date2 = dayjs(orderData.t);
      console.log('difference', date2.diff(date1, 'day'));
      const dayDifference = date2.diff(date1, 'day');
      const  avgOrderIncrement = (order.y - orderData[index-1].y) / dayDifference;
      console.log('avgs..', avgOrderIncrement);

      // we shift the 'differece' value to line up with date1 so that
      // avg *starts* at that date
      const backDate = orderData[index-1].t;
      newData.push({'y': avgOrderIncrement, 't': backDate });

      // for stepped graph, we then need a final data point 
      // that is the final date and a repeat of the avg order value
      // also valid as 'extrapolation' technique for non-stepped
      if (index === (totalDataPoints-1)) {
        newData.push(({'y': avgOrderIncrement, 't': order.t }));
      }
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