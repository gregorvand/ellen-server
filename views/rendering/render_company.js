const Company = require('../../server/models').Company;
const Order = require('../../server/models').Order;
const dayjs = require('dayjs');
const Op = require('sequelize').Op;


const renderCompanyPage = function(req, res) {

  const companyPromise = getCompanyForPage(req).then(returnedCompany => {
    currentCompany = returnedCompany;
  })

  const orderPromise = getOrders(req.params.id).then(returnedOrders => {
    //  ordersData = doSomethingToData(returnedOrders);
    ordersData = getOrderDifferenceIncrement(returnedOrders);
    avgData = getDayAvgOrders(returnedOrders);
  })

  const latestEmailsPromise = getAllCompanyEmails(req.params.id, req.user).then(allEmails => {
    userOrders = allEmails;
  })

  Promise.all([companyPromise, orderPromise, latestEmailsPromise]).then(() => {
    res.render("company", { 
      company: currentCompany,
      orders: ordersData,
      avgOrders: avgData,
      // helpers: companyHelpers,
      allOrders: userOrders
    });
  })
}

function getOrderDifferenceIncrement(orders) {
  const orderData = orders.map(order => order.dataValues)
  // console.log(orderData);
  totalDataPoints = orderData.length;
  let newData = new Array;
  orderData.forEach((order, index) => {
    if (index !== 0) {
      // get timestamp difference first and store as a day value, divide by no. of days between

      // if date1 and date2 are the same, remove the last loop's data, get 
      const date1 = dayjs(orderData[(index-1)].t);
      const date2 = dayjs(order.t);
      const dayDifference = date2.diff(date1, 'day');
      const avgOrderIncrement = ((order.y - orderData[index-1].y) / dayDifference).toFixed(2);

      // if we have two of the same date, discard the higher number (easier solution day one)
      if (!date1.isSame(date2, 'day')) {
        
        // GOOD DEBUG
        // console.log('data stuff', order.y, date1, date2, dayDifference, avgOrderIncrement);

        // we shift the 'differece' value to line up with date1 so that
        // avg *starts* at that date
        const backDate = orderData[index-1].t;
        newData.push({'y': avgOrderIncrement, 't': backDate });
  
        // for stepped graph, we then need a final data point 
        // that is the final date and a repeat of the avg order value
        // also valid as 'extrapolation' technique for non-stepped
        if (index === (totalDataPoints-1)) {
          newData.push({'y': avgOrderIncrement, 't': order.t });
        }
      } else {
        console.log(`yikes we got two of the same!, ignoring ${order.y}`);
      }
    }

    console.log(newData);
  });

  return newData;
}

function getDayAvgOrders(orders) {
  const totalOrders = orders.length;
  const orderData = orders.map(order => order.dataValues)

  if (orderData.length > 0) {
    const dayOneOrder = orderData[0].y;
    const dayFinalOrder = orderData[totalOrders -1].y;
    const orderDifference = dayFinalOrder - dayOneOrder;
   
    const dayOneDate = dayjs(orderData[0].t);
    const dayFinalDate = dayjs(orderData[totalOrders -1].t);
    const dayDifference = dayFinalDate.diff(dayOneDate, 'day');
  
    const avgOrdersAll = orderDifference / dayDifference;
  
    //  logs..
    // console.log('order diff', orderDifference);
    // console.log(dayOneDate);
    // console.log(dayOneOrder);
    // console.log(dayFinalOrder);
    // console.log('total diff', dayDifference); 
    // console.log('avg', avgOrdersAll); 
    
   return avgOrdersAll.toFixed(2);
  } 
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
      companyId: id,
      orderNumber: {
        [Op.gt]: 1
      }
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

function getAllCompanyEmails (id, user) {
  if (user.status == 'admin') {
    return Order
    .findAll({
      where: {
        companyId: id
      },
      order: [ ['createdAt', 'DESC'] ]
    })
  } else {
    // if not admin, just return an empty undefined Promise 
    // for Promose.all to move on
    return Promise.resolve();
  }
};

module.exports.renderCompanyPage = renderCompanyPage;


let compare6 = function(dataArray) {
  dataArray.forEach(function(item, index) {
    const lastItem = dataArray[index-1];
    if (item != lastItem) {
      console.log('using', item);
    }
  });
}