require('dotenv').config()
const csv = require('csvtojson')
const db = require('./models/index')
// const Company = require('./models').Company
// const elasticsearch = require('elasticsearch')

// const client = new elasticsearch.Client({
//   // hosts: ['http://localhost:9200'],
//   hosts: ['http://ellen-search.ngrok.io'],
// })

const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  cloud: {
    id: 'ellen-companies-search-alpha2:dXMtd2VzdDEuZ2NwLmNsb3VkLmVzLmlvJDFjMmI4OGQ4ZDMwZjQ2NjZhNWIxN2ExYjYxNzk5ZTg0JDc4NjM0NzUwNzkyYTQ2Mzc5N2NmNDk5MGFiNDNmOWUz',
  },
  auth: {
    username: 'elastic',
    password: 'LYzbdTrBZsFxNlFHH4q6W0b1',
  },
})

// Needed to update elasticsearch index
async function populateDB() {
  let bulk = []
  // const [companies] = await db.sequelize.query(
  //   `SELECT * FROM public."IndexedCompanies"`
  // )

  // from file
  const companies = await csv().fromFile(
    '../edison_data/ellen_indexedco_prod_21-11.csv'
  )

  companies.forEach((company, i) => {
    console.log(company.nameIdentifier)
    let data = {
      id: company.id,
      companyName: company.nameIdentifier,
      companyEmail: company.emailIdentifier,
      companyIndustry: company.industry,
    }

    bulk.push({
      index: {
        _index: 'ellen_companies_prod', // ellen_companies_prod
        _type: 'companies_list',
        _id: company.id,
      },
    })

    bulk.push(data)
  })

  client.bulk({ body: bulk }, function (error, response) {
    if (error) {
      console.log('Failed Bulk operation', error)
    } else {
      console.log(response)
    }
  })
}

populateDB()
// activate above to run a DB sync
