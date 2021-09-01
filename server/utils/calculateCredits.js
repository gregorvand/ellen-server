const defaultCreditCost = 20 // in case env variable is forgotten. don't give away for free!

module.exports = {
  calculateCreditsFromCharge(stripeCharge) {
    return (
      stripeCharge / (process.env.TOKEN_COST_USD || defaultCreditCost) / 100
    )
  },

  calculateChargeFromCredits(creditAmount) {
    return (
      creditAmount * (process.env.TOKEN_COST_USD || defaultCreditCost) * 100
    )
  },
}
