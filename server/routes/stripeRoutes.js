const chargeHelpers = require('../utils/calculateCredits')
const creditTransactionController = require('../controllers/creditTransaction')
const userHelpers = require('../utils/getUserFromToken')
const auth = require('../middleware/getToken')

const stripe = require('stripe')(process.env.STRIPE_API_SEC)

module.exports = (app, express) => {
  const calculateOrderAmount = (chargeAmount) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return chargeHelpers.calculateChargeFromCredits(chargeAmount)
  }

  app.post('/create-payment-intent', express.json(), async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    const tokenArray = req.headers.authorization.split('Bearer ')
    const currentUser = await userHelpers.currentUser(tokenArray[1])

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        // amount: calculateOrderAmount(req.body.chargeAmount),
        amount: calculateOrderAmount(req.body.chargeAmount),
        currency: 'usd',
        customer: currentUser.stripeCustomerId,
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      })
    } catch (error) {
      console.error('could not create intent..', error)
    }
  })

  const User = require('../models').User
  const endpointSecret = process.env.STRIPE_WEBHOOK_AUTH_SEC
  // Use body-parser to retrieve the raw body as a buffer
  app.post(
    '/stripe-webhook',
    require('body-parser').raw({ type: '*/*' }),
    async (request, response) => {
      const sig = request.headers['stripe-signature']

      let event
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        )
        handleStripeWebook(event)
        response.json({ received: true })
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`)
      }

      // Return a response to acknowledge receipt of the even
    }
  )
  // only create if customer does not already have a stripe customer ID
  app.post('/create-stripe-customer', async (req, res) => {
    // Create a new customer object
    const tokenArray = req.headers.authorization.split('Bearer ')
    const currentUser = await userHelpers.currentUser(tokenArray[1])

    try {
      if (!currentUser.stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: currentUser.email,
        })

        const dbUser = await User.findOne({
          where: {
            id: currentUser.id,
          },
        })

        dbUser.stripeCustomerId = stripeCustomer.id
        await dbUser.save()

        res.send({ stripeCustomer })
      } else {
        res.send(`${currentUser.email} already has Stripe ID`)
      }
    } catch (error) {
      res.send('cannot create stripe customer', error).status(400)
    }
  })

  // CREATE SUBSCRIPTION
  const Subscription = require('../models').Subscription
  app.use(express.json())
  app.post('/create-subscription', auth.getToken, async (req, res) => {
    const priceId = req.body.priceId
    const quantity = req.body.quantity
    const currentUser = await userHelpers.currentUser(req.token)
    const dbUser = await User.findOne({
      where: {
        id: currentUser.id,
      },
    })

    const stripeCustomerId = dbUser.stripeCustomerId

    try {
      // Create the subscription. Note we're expanding the Subscription's
      // latest invoice and that invoice's payment_intent
      // so we can pass it to the front end to confirm the payment

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      })

      Subscription.create({
        stripe_sub_id: subscription.id,
        current_period_end: subscription.current_period_end,
        customer: subscription.customer,
        customerId: currentUser.id,
      })

      res.send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    } catch (error) {
      return res.status(400).send({ error: { message: error.message } })
    }
  })

  app.get('/current-cards-subscriptions', auth.getToken, async (req, res) => {
    const tokenArray = req.headers.authorization.split('Bearer ')
    const currentUser = await userHelpers.currentUser(tokenArray[1])

    const paymentMethods = await stripe.paymentMethods.list({
      customer: currentUser.stripeCustomerId,
      type: 'card',
    })

    const subscriptions = await stripe.subscriptions.list({
      customer: currentUser.stripeCustomerId,
    })

    res.send({ cards: paymentMethods.data, subscriptions: subscriptions })
  })

  app.delete('/subscription', auth.getToken, async (req, res) => {
    const deleted = await stripe.subscriptions.del(req.body.subId)
    res.send(deleted)
  })

  const handleStripeWebook = async function (event) {
    let ellenUser

    switch (event.type) {
      case 'invoice.payment_succeeded':
        // sets the card used as the default payment method for subscription
        const dataObject = event.data.object
        console.log('sub data: ', dataObject)
        const creditsPurchased = dataObject.lines.data[0].quantity

        ellenUser = await User.findOne({
          where: {
            email: dataObject.customer_email,
          },
        })

        console.log('adding', creditsPurchased)
        creditTransactionController.create({
          creditValue: creditsPurchased,
          activated: true,
          method: 'subscription',
          customerId: ellenUser.dataValues.id,
        })

        if (dataObject['billing_reason'] == 'subscription_create') {
          const subscription_id = dataObject['subscription']
          const payment_intent_id = dataObject['payment_intent']

          // Retrieve the payment intent used to pay the subscription
          const payment_intent = await stripe.paymentIntents.retrieve(
            payment_intent_id
          )

          const subscription = await stripe.subscriptions.update(
            subscription_id,
            {
              default_payment_method: payment_intent.payment_method,
            }
          )
          break
        }
      case 'charge.succeeded':
        const chargeObject = event.data.object
        console.log('charge data: ', chargeObject)

        // TODO move to using Stripe products/pricing eventually for top ups, but for now
        // we're just going to use the charge amount to determine the credits to add based on our sliding scale
        let creditsToAdd
        console.log('amount: ', parseInt(chargeObject.amount))

        switch (chargeObject.amount / 100) {
          case 300:
            creditsToAdd = 10
          case 500:
            creditsToAdd = 20
          case 1000:
            creditsToAdd = 50
          case 1500:
            creditsToAdd = 100
        }

        let ellenChargeUser = await User.findOne({
          where: {
            email: chargeObject.billing_details.email,
          },
        })

        creditTransactionController.create({
          creditValue: creditsToAdd,
          activated: true,
          method: 'credit top up',
          customerId: ellenChargeUser.dataValues.id,
        })
        console.log(
          `Charge was successful! from ${chargeObject.id}, ${chargeObject.billing_details.email}`
        )
        break
      case 'payment_method.attached':
        console.log('PaymentMethod was attached to a Customer!')
        break
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  }
}
