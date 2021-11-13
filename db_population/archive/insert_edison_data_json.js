require('dotenv').config()
const Company = require('../server/models').Company
// const EdisonData = require('./data/csvjsonFIGS_chunk1_uniqueChecksum_test.json')
const ordersControllerEdison = require('../server/controllers/ordersByEdison')
const csv = require('csvtojson')

// get data
const csvFilePath = '../edison_data/export_clbcf_001.csv'

// Steps
// insertEdisonDataOneCompany()
insertEdisonDataMultiCompany()

// Functions
async function convertCSV() {
  const jsonArray = await csv({
    // parse order number here to number format for later checks
    colParser: { order_number: 'number' },
  }).fromFile(csvFilePath)
  return jsonArray
}

async function insertEdisonDataOneCompany() {
  const data = await convertCSV()
  const rowOneData = data[0]
  // console.log(rowOneData)
  let companyId = false
  companyId = getOrCreateCompany(rowOneData)

  // MULTI ROW
  // comment out below and enable @ 60 to debug one row
  // data.forEach((edisonRow) => {
  //   ordersControllerEdison.insertEdisonRow(companyId, edisonRow)
  // })

  // ONE ROW
  // DEBUG WITH JUST ONE ROW
  // const edisonRow = data[0]
  // ordersControllerEdison.insertEdisonRow(companyId, edisonRow)
}

async function insertEdisonDataMultiCompany() {
  const data = await convertCSV()
  // console.log(rowOneData)

  // MULTI ROW
  // comment out below and enable @ 60 to debug one row
  data.map(async (edisonRow) => {
    const companyId = await getOrCreateCompany(edisonRow)
    console.log('company:', companyId)
    ordersControllerEdison
      .insertEdisonRow(companyId, edisonRow)
      .then((result) => {
        console.log(result)
      })
  })
}

// Helpers
async function getEdisonDataTest() {
  const EdisonData = await convertCSV()
  console.log(EdisonData[0])
}

async function getOrCreateCompany(dataRow) {
  let newCompany = false
  let companyId = false

  const isACompany = await Company.findOne({
    where: {
      emailIdentifier: dataRow.from_domain,
    },
  })

  const isADuplicate = await Company.findOne({
    where: {
      nameIdentifier: dataRow.item_reseller,
    },
  })

  const duplicateMarker = isADuplicate !== null ? 'duplicate' : ''

  console.log('yo', isACompany)
  console.log('duplicate?', isADuplicate)

  if (isACompany !== null) {
    companyId = isACompany.id
  } else {
    console.log('got to new company..')
    newCompany = await Company.create({
      nameIdentifier: dataRow.item_reseller,
      emailIdentifier: dataRow.from_domain,
      orderPrefix: '#',
      orderSuffix: duplicateMarker,
      companyType: 'private',
      industry: 'Shopify',
    }).then((newCompany) => newCompany)
  }

  return newCompany ? (companyId = newCompany.id) : companyId
}

// getEdisonDataTest()
