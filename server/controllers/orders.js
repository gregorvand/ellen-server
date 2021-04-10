const Order = require('../models').Order;
const Company = require('../models').Company;
const SentryInit = require('../services/sentryInit');
const pointsController = require('../controllers/points');
const pointsValues = require('../utils/constants').POINTS;
const pointsTransactionQueue = require('../services/bull-queues').pointsTransactionQueue;
const { Op } = require("sequelize");

module.exports = {
  create(req, res, orderNumber) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    return Order
      .create({
        orderNumber: orderNumber || req.body.number || 1,
        orderDate: req.body.date || Date.now(),
        fromEmail: req.body.fromEmail || 'shop@sendertest.com',
        customerEmail: req.body.customerEmail || 'gregor@vand.hk',
        plainContent: req.body.content || 'Hello this is the email stuff!',
        companyId: req.body.companyId || 1
      })
      .then(company => res.status(201).send(company))
      .catch(error => res.status(400).send(error));
  },

  internalCreate(req = false, orderNumber, fromEmail, companyId, customerEmail, customerId, subject, emailPlainContent) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    console.log(customerEmail);

    // get customerEmail
    // let customerByEmail = await User.findOne({ where: { email: customerByEmail } }); // what about customer identifer to find customer?

    try {
      return Order
      .create({
        orderNumber: orderNumber || req.body.number,
        orderDate: orderDate || null,
        fromEmail: fromEmail || 'notfound@ellen.me',
        customerEmail: req.body.customerEmail || customerEmail,
        plainContent: req.body.content || emailPlainContent,
        companyId: companyId || 1,
        customerId: customerId || 1,
        subjectLine: subject
      })
      .then(order => { 
        console.log('completed!', order);
        const pointsActivated = order.orderNumber === '1' ? false : true;
        pointsController.internalCreate(pointsValues.single, customerId, pointsActivated, 1, order.id);
        afterCreateTasks(order);
      }) // also call Points add with true/false activate flag on order number value
      .catch(error => { SentryInit.captureException(error); });
    } catch(e) {
      SentryInit.setUser({ email: customerEmail });
      SentryInit.captureException(e);
    }
  },

  list(req, res) {
    if(req.body.email) {
      return Order.findAll({
        where: {
          customerEmail: req.body.email
        }
      })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
    } else {
      return Order
      .findAll()
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
    }
  },

  listByCustomer(req, res) {
    return Order
    .findAll({
      where: {
        customerId: req.params.userId
      },
      include: [{
        model: Company,
        attributes: ['nameIdentifier'],
      }],
      order: [ [ Company, 'nameIdentifier', 'ASC' ] ],
      raw: true
    })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
  },

  update(req, res) {
    return Order
      .findByPk(req.params.id)
      .then(order => {
        if (!order) {
          return res.status(404).send({
            message: 'Order record Not Found',
          });
        }
        return order
          .update({
            orderNumber: req.body.orderNumber || 1,
          }, {
            returning: true,
            plain: true,
            logging: false
          })
          .then((order) => {
            afterOrderUpdateTasks(order);
          })
          .then(() => 
            res.status(200).send('updated yow!'),
          )
          .catch((error) => res.status(400).send(error));
      }).catch((error) => res.status(400).send(error));
  }
};

async function afterOrderUpdateTasks (updatedOrder) {
  console.log('THE UPDATED IS', updatedOrder.orderNumber);
  const orderData = updatedOrder.dataValues;

  // validate whether basic points should be activated
  pointsController.validatePointsTransaction(orderData.id, orderData.orderNumber !== '1');  
  
  // check if first [valid]Order for that Company, award bonus if so 
  validateIfFirstOrder(orderData);

  // check if this is the first VALID order for this company, award 30 points if yes

  // REPEAT EXAMPLE - RUN EVERY ONE MINUTE
  // pointsTransactionQueue.add({
  //   foo: 'bar3'
  // }, { repeat: { cron: '*/1 * * * *' } });
}

async function afterCreateTasks (createdOrder) {
  const orderData = createdOrder.dataValues;
  validateIfFirstOrder(orderData);
}

async function checkFirstOrderForCompany (orderId) {
  // checks if:
  // This is order is valid, and
  // if so, is it the first of those valid orders
  return Order
    .findByPk(orderId)
    .then(order => { 
      // lookup all orders with this company
      return Order
      .findAll({ 
        where: {
          companyId: order.companyId,
          orderNumber: { [Op.not]: 1 },
        },
        order: [
          ['createdAt', 'ASC']
        ]
      })
      .then((allOrders) => {
        return orderId === allOrders[0]?.id;
      })
      // .catch((error)) => console.log('no orders yet / all orders invalid', error));
    })
  };

  async function validateIfFirstOrder (orderData) {
    // check if first [valid]Order for that Company, award bonus if so 
    const isFirstForThisCompany = await checkFirstOrderForCompany(orderData.id) || false;
    if (isFirstForThisCompany) {
      pointsTransactionQueue.add(
        pointsController.internalCreate(pointsValues['new-company'], orderData.customerId, true, 2, orderData.id)
      );
    }
  }

  // async function returnOrder (lookup) {
//   return Order
//     .findOne({
//       where: [lookup],
//     })
//     .then((foundOrder) => foundOrder)
//     .catch((error) => console.error(error));
// }

// module.exports.returnOrder = returnOrder;