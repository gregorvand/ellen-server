const stripe = require('stripe')(
  'sk_test_51JS9eTG3YpE4JrlJc6uQRxZLkXszTng6xf8F45KN2kqO3yZctOoOn2djQaT5mkZe7hmLmMNLWwLYunIZ7EVxSw5E00KbgNEgMZ'
)

module.exports = (app) => {
  const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400
  }
  app.post('/create-payment-intent', async (req, res) => {
    const { items } = req.body
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: 'usd',
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
    })
  })
}
