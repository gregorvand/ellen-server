const Order = require('../models').Order;
const Company = require('../models').Company;
// const TodoItem = require('../models').TodoItem;

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
          })
          .then(() => res.status(200).send('updated!'))  // Send back the updated todo.
          .catch((error) => res.status(400).send(error));
      })
    .catch((error) => res.status(400).send(error));
  }
};
