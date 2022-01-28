// Make copy of local
// TRUNCATE prod
// restore

require('dotenv').config()
const shell = require('shelljs')

const { textDate } = require('../server/utils/getToday')
const date = textDate()

shell.exec(
  `pg_dump --file "../../ellen_data_exports/aov_backup_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --section=data --table "public.aov_indexed_companies" "todos-dev"`
)

shell.exec(
  `pg_dump --file "../../ellen_data_exports/act_backup_${date}" --host "127.0.0.1" --port "5432" --username "postgres" --no-password --verbose --format=c --blobs --section=data --table "public.act_indexed_companies" "todos-dev"`
)

const db = require('../server/models/index')
db.sequelize
  .query(`TRUNCATE public.aov_indexed_companies RESTART IDENTITY`)
  .then(() => {
    shell.exec(
      `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_data_exports/aov_backup_${date}"`
    )
  })

db.sequelize
  .query(`TRUNCATE public.act_indexed_companies RESTART IDENTITY`)
  .then(() => {
    shell.exec(
      `pg_restore -d "postgresql://doadmin:${process.env.PGPASSWORD}@${process.env.PGHOST}:25060/todos-dev?sslmode=require" --jobs 4 --verbose -c --schema "public" "../../ellen_data_exports/act_backup_${date}"`
    )
  })
