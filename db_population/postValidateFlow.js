require('dotenv').config()
const { textDate } = require('../server/utils/getToday')
const shell = require('shelljs')

const date = textDate()

// STEP 1: DUMP THE INDEXED ORDERS DB
shell.exec(
  `pg_dump --file "../../ellen_db_dumps/IndexedEdisonOrders_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --t 'public."IndexedEdisonOrders"' "todos-dev"`
)

// STEP 2, copy verified Company records to IndexedCompanies (-l)
shell.exec('node ./companyToIndexed.js -l')

// STEP 3, Create a CSV of the local IndexedCompanies result
// Lives at indexedCompanies_${date}.csv
shell.exec('node ./indexedCompaniesToCSV.js')

// Use the above output to update live (-p) DB IndexedCompanies
shell.exec('NODE_ENV=production node ./companyToIndexed.js -p')

// STEP 4, Create a CSV of the live IndexedOrders result, ready for ES index update
shell.exec('NODE_ENV=production node ./indexedCompaniesToCSV.js')

// STEP 5, Update the ES index with the CSV
shell.exec('NODE_ENV=production node ../server/elasticsearch_prod.js')

// STEP XX, drop/restore to the live DB instance
// WARNING THIS WILL CAUSE SERVICE INTERRUPTION, APP SHOULD BE IN MAINTENAANCE MODE
// NORMAL TIME IS ~15 MINS DUE TO REINDEXING
// shell.exec(
//   `pg_restore -d "postgresql://doadmin:js52ltnjsa83psra@db-postgresql-sfo2-79931-do-user-8723588-0.b.db.ondigitalocean.com:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_db_dumps/IndexedEdisonOrders_${date}"`
// )
