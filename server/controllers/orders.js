const Order = require('../models').Order;
const Company = require('../models').Company;
const SentryInit = require('../services/sentryInit');
const pointsController = require('../controllers/points');

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
        pointsController.internalCreate(10, customerId, pointsActivated, 1, order.id);
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
            const consoleData = `${order.dataValues.orderNumber} (${order.dataValues.id})`;
            if (order.dataValues.orderNumber === '1') {
              console.log(`dont validate`, consoleData);
              pointsController.validatePointsTransaction(order.dataValues.id, false);
            } else {
              console.log(`do validate`, consoleData);
              pointsController.validatePointsTransaction(order.dataValues.id);
            }
          })
          .then(() => 
            res.status(200).send('updated yow!'),
          )
          .catch((error) => res.status(400).send(error));
      }).catch((error) => res.status(400).send(error));
  }
};

async function returnOrder (lookup) {
  return Order
    .findOne({
      where: [lookup],
    })
    .then((foundOrder) => foundOrder)
    .catch((error) => console.error(error));
}

module.exports.returnOrder = returnOrder;