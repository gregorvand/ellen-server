require('dotenv').config()
const { textDate } = require('../server/utils/getToday')
const shell = require('shelljs')
const date = textDate()

// --------------------------------------------------
// Script that should be run every time we have verified more companies
// ie, when IndexedCompanies and IndexedEdisonOrders has an update
// Likely needs to be run every working day
// --------------------------------------------------

// 1
// DUMP THE INDEXED ORDERS DB
console.log('\n Step 1')
shell.exec(
  `pg_dump --file "../../ellen_db_dumps/IndexedEdisonOrders_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --t 'public."IndexedEdisonOrders"' "todos-dev"`
)

// 2
// copy verified Company records to IndexedCompanies (-l)
console.log('\n Step 2')
shell.exec('node ./companyToIndexed.js -l')

// 3
// Create a CSV of the local IndexedCompanies result
// Lives at indexedCompanies_${date}.csv
console.log('\n Step 3')
shell.exec('node ./indexedCompaniesToCSV.js')

// 4
// Use the above output to update live (-p) DB IndexedCompanies
console.log('\n Step 4')
shell.exec('NODE_ENV=production node ./companyToIndexed.js -p')

// 5
// Create a CSV of the live IndexedOrders result, ready for ES index update
console.log('\n Step 5')
shell.exec('NODE_ENV=production node ./indexedCompaniesToCSV.js')

// 6 Do AOV and ACT run (if needed)
shell.exec('node getAOV.js')
shell.exec('node getACT.js')
shell.exec('node getTSI.js')

// 7
// Copy over latest AOV and ACT
console.log('\n Step 6')
shell.exec(`NODE_ENVnode copyMetricsToProd.js`)

// 8
// drop/restore to the live DB instance
// WARNING THIS WILL CAUSE SERVICE INTERRUPTION, APP SHOULD BE IN MAINTENAANCE MODE
// NORMAL TIME IS ~15 MINS DUE TO REINDEXING
console.log('\n Step 7')
shell.exec(
  `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_db_dumps/IndexedEdisonOrders_${date}"`
)

// 9
// Finally, Update the ES index with the CSV
// Should always be after data refreshed above (ie current step 8)
console.log('\n Step 8')
shell.exec('NODE_ENV=production node ../server/elasticsearch_prod.js')
