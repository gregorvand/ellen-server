function generateCompanyRegex(orderPrefix) {
  let regex = `^\\d+$`
  if (orderPrefix !== '#') {
    regex = `${orderPrefix}\\d+$`
  }
  return regex
}

module.exports = generateCompanyRegex
