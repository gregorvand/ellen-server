const db = require('./models/index')
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

// client.ping(
//   {
//     requestTimeout: 50000,
//   },
//   function (error) {
//     if (error) {
//       console.error('Cannot connect to Elasticsearch.')
//     } else {
//       console.log('Connected to Elasticsearch was successful!')
//     }
//   }
// )
// client.search(
//   {
//     index: 'csjoblist',
//     type: 'jobs_list',
//     body: {
//       query: {
//         match: { nameIdentifier: 'Brooklyn Tweed' },
//       },
//     },
//   },
//   function (error, response, status) {
//     if (error) {
//       console.log(error)
//     } else {
//       console.log(response)
//       response.hits.hits.forEach(function (hit) {
//         console.log(hit)
//       })
//     }
//   }
// )

// Needed to update elasticsearch index

async function populateDB() {
  let bulk = []
  const [companies] = await db.sequelize
    .query
    // `SELECT * FROM public."Companies"
    // WHERE
    //   "emailIdentifier" ~ '/^([a-zA-Z0-9_]+)@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.)|(?!hotmail|gmail|yahoo|qq|marketplace|outlook|relay|ebay|members)(([a-zA-Z0-9-]+.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(]?)$'
    // AND "industry" = 'Shopify'`

    // `SELECT * FROM public."Companies"
    // WHERE
    // "createdAt" > current_date - interval '1' hour
    // AND "emailIdentifier" ~ '^([a-zA-Z0-9_]+)@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.)|(?!hotmail|gmail|yahoo|qq|marketplace|outlook|relay|ebay|members)(([a-zA-Z0-9-]+.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(]?)$'
    // AND "industry" = 'Shopify'`

    // `SELECT * FROM public."Companies"
    // WHERE
    // "id" = '6'`
    ()

  console.log('indexing', companies.length)

  companies.forEach((company, i) => {
    let data = {
      id: company.id,
      companyName: company.nameIdentifier,
      companyEmail: company.emailIdentifier,
      ticker: company.ticker,
      companyType: company.companyType,
      companyIndustry: company.industry,
    }

    let ES_index =
      process.env.NODE_ENV === 'production'
        ? 'ellen_companies_prod'
        : 'ellen_companies_dev'

    bulk.push({
      index: {
        _index: ES_index, // ellen_companies_prod
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
