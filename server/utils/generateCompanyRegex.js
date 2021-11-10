// Returns a regex that matches a company's orderPrefix if
// the company has one assigned other than '#' (default)
function generateCompanyRegex(orderPrefix) {
  let regex = `^\\d+$`
  if (orderPrefix !== '#') {
    regex = `${orderPrefix}\\d+$`
  }
  return regex
}

module.exports = generateCompanyRegex
