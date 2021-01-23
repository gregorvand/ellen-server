# Data DTC v1 (Ellen Insights)

## Up and Running

This is a Node/Express/Postgres/Sequelize -based app, and currently uses simple EJS templating for server-side rendering of views

- `npm i`
- copy `/server/congif_template.json` and rename to `config.json` and add PG database info
- copy `.env_template` and rename to `.env`, add required details (get from an existing developer)
- `npm sequelize:migrate` to run a first migration and set up DB
- Also run a one-off set up of the `sessions` table using the `CREATE TABLE "session"` file commands (this is just an easier to find copy of the file that comes with `connect-pg-simple` which manages db-based user sessions)
- `npm run start:dev` to begin server on 8000
- `npm run sass` to start watching scss / compiling css files from `/sass` directory (when doing any style work)

## Modifying the DB

We are not using Sequelize `.sync()` since this is not suitable once the app gets to Production, so we are doing migrations from day 1. However, to make these easier to generate we are using a recommended fork of `sequelize-auto-migrations` as per [this post](https://stackoverflow.com/a/59021807/707747) and follow the instructions 7-10 from this post for modifying the DB via the Models.

---

Contact [gregorvand](https://github.com/gregorvand) for help with anything.