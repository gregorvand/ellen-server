// Make copy of local
// restore
// cannot truncate/update due to DO database access (as root) constraints

require('dotenv').config()
const shell = require('shelljs')

const { textDate } = require('../server/utils/getToday')
const date = textDate()

shell.exec(
  `pg_dump --file "../../ellen_data_exports/aov_backup_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --table "public.aov_indexed_companies" "todos-dev"`
)

shell.exec(
  `pg_dump --file "../../ellen_data_exports/act_backup_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --table "public.act_indexed_companies" "todos-dev"`
)

shell.exec(
  `pg_dump --file "../../ellen_data_exports/tsi_backup_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --table "public.tsi_indexed_companies" "todos-dev"`
)

console.log(`restoring from ${date}`)
console.log('now restoring... aov')
shell.exec(
  `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_data_exports/aov_backup_${date}"`
)

console.log('now restoring... act')
shell.exec(
  `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_data_exports/act_backup_${date}"`
)

console.log('now restoring... tsi')
shell.exec(
  `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_data_exports/tsi_backup_${date}"`
)
