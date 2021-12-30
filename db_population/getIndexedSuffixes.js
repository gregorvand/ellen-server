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

    let suffixMap = allSuffixIndexedCompanies.map((indexedCo) => {
      return {
        identifier: indexedCo.emailIdentifier,
        suffix: indexedCo.orderSuffix,
      }
    })

    const filteredSuffixMap = suffixMap.filter((company) => {
      return company.suffix !== 'duplicate' && company.suffix !== 'null'
    })

    console.log(
      `found ${filteredSuffixMap.length} suffix companies with non-empty suffixes and excluding 'duplicate'`
    )

    return filteredSuffixMap
  },
}
