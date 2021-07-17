module.exports = {
  currencyFormatter: function (currencySymbol = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol,
      maximumSignificantDigits: 7,
    })
  },
}
