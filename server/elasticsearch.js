const Company = require('./models').Company
const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  hosts: ['http://localhost:9200'],
})

client.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    if (error) {
      console.error('Cannot connect to Elasticsearch.')
    } else {
      console.log('Connected to Elasticsearch was successful!')
    }
  }
)
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
  const companies = await Company.findAll()

  companies.forEach((company, i) => {
    let data = {
      id: company.id,
      companyName: company.nameIdentifier,
    }

    bulk.push({
      index: {
        _index: 'csjoblist',
        _type: 'jobs_list',
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

// populateDB()
// activate above to run a DB sync
