require('dotenv').config()
const Company = require('../server/models').Company
const Op = require('sequelize').Op

module.exports = {
  async getAllIndexedCompanySuffixes() {
    console.log('local')
    const allSuffixIndexedCompanies = await Company.findAll({
      where: {
        orderSuffix: {
          [Op.ne]: '',
        },
      },
    })
    console.log(`found ${allSuffixIndexedCompanies.length} suffix companies`)

    let suffixMap = allSuffixIndexedCompanies.map((indexedCo) => {
      return {
        identifier: indexedCo.emailIdentifier,
        suffix: indexedCo.orderSuffix,
      }
    })

    const filteredSuffixMap = suffixMap.filter((company) => {
      return company.suffix !== 'duplicate' && company.suffix !== 'null'
    })

    return filteredSuffixMap
  },
}
