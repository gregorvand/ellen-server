const Order = require('../models').Order;
const Company = require('../models').Company;
const SentryInit = require('../services/sentryInit');
const pointsController = require('../controllers/points');
const pointsValues = require('../utils/constants').POINTS;
const { Op } = require("sequelize");
// const pointsTransationQueue = require('../services/bull-queues').pointsTransactionQueue;


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
        const pointsActivated = order.orderNumber === '1' ? false : true;
        pointsController.internalCreate(pointsValues.single, customerId, pointsActivated, 1, order.id);
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
  const orderData = updatedOrder.dataValues;  


  // AFTER UPDATE
  // 1 check if order now valid and
  // validate (or not) all points transactions associated
  pointsController.validateAllPointsTransactionsForOrder(orderData.id, orderData.orderNumber !== '1');  
  
  // 2 check if order is the first now valid order
  checkFirstOrderForCompany(orderData.id);

  // 4 upsert a 'first email' bonus if it is now the first valid  (ie check for reason2 point)



  // pointsTransationQueue.add({
  //   foo: 'bar'
  // });
  
  // REPEAT EXAMPLE - RUN EVERY ONE MINUTE
  // pointsTransationQueue.add({
  //   foo: 'bar3'
  // }, { repeat: { cron: '*/1 * * * *' } });
}

async function checkFirstOrderForCompany (orderId) {
  // lookup order in DB
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
        if (orderId === allOrders[0].id) {
          console.log(`yeah first! ${orderId} ${allOrders[0].id}`);
        } else {
          console.log('noppppe');
        }
      })
    })
  };

  // lookup all orders in the given company