# Ellen Insights - API Server

This is a Node/Express/Postgres/Sequelize -based app, ~~and currently uses simple EJS templating for server-side rendering of views~~

The app had support for EJS SSR templating, however this API server is now intended to be used with a standalone front-end. 

Currently this is Vue.js-based and located here: https://github.com/gregorvand/ellen-vue

## Up and Running

- `npm i`
- copy `/server/config_template.json` and rename to `config.json` and add PG database info
- copy `.env_template` and rename to `.env`, add required details (get from an existing developer)
- `npm sequelize:migrate` to run a first migration and set up DB
- Also run a one-off set up of the `sessions` table using the `CREATE TABLE "session"` file commands (this is just an easier to find copy of the file that comes with `connect-pg-simple` which manages db-based user sessions)
- `npm run start:dev` to begin server on 8000
- `npm run sass` to start watching scss / compiling css files from `/sass` directory (when doing any style work)

----
## Redis
You will need a redis server running (ie in termninal `redis-server`) on the default port (6379) to handle background tasks for calculating ad assigning Points.

----
## Stripe webhook
For any new instance (prod / local) go to the [Stripe webhook dashboard](https://dashboard.stripe.com/test/webhooks) and ensure a webhook has been added to send to `[your server address]/stripe-webhook`.

For local environments you will need a tunnel running via [ngrok.io](ngrok.io) or similar to receive these

### Webhooks required (as of 1/10/2021)
**charge**
- succeeded

**payment_method**
- attached

**invoice**
- payment_succeeded


 ----

## Modifying the DB

We are not using Sequelize `.sync()` since this is not suitable once the app gets to Production, so we are doing migrations from day 1. However, to make these easier to generate we are using a recommended fork of `sequelize-auto-migrations` as per [this post](https://stackoverflow.com/a/59021807/707747) and follow the instructions 7-10 from this post for modifying the DB via the Models.

### Dependency
Ensure you have run `npm i -g github:scimonster/sequelize-auto-migrations#a063aa6535a3f580623581bf866cef2d609531ba` before running the below.

This is a specific patch of the `sequelize-auto-migration` module that is not on npm but compatible with the latest Sequelize version. Without extra config, trying to build with this in the package.json fails since it is not on npm, so it is recommended to install globally locally.

### Migration steps
Those steps in the link above were captured at commit time as:

1. Delete all old migrations if any exist.
1. Turn off .sync()
1. Create a mega-migration that migrates everything in your current models. Assuming globally installed: `makemigration --name "mega-migration`.
1. Commit your 01-mega-migration.js and the _current.json that is generated.
1. if you've previously run .sync() or hand-written migrations, you need to “Fake” that mega-migration by inserting the name of it into your SequelizeMeta table. INSERT INTO SequelizeMeta Values ('01-mega-migration.js').
1. Now you should be able to use this as normal…
1. Make changes to your models (add/remove columns, change constraints)
1. Run $ `makemigration --name whatever` (assumes globally installed module)
1. Commit your 02-whatever.js migration and the changes to _current.json, and _current.bak.json.
1. Run your migration through the normal sequelize-cli: $ yarn sequelize db:migrate.
Repeat 7-10 as necessary

> Note we have globally the module, since google cloud run errors out when trying to build with our specific version 

> KNOWN GOTCHA - renaming a column will remove and add a column, *removing* the data.

Renaming will require something like:

```
{
    fn: "renameColumn",
    params: [
        "table_name",
        "column_name_before",
        "column_name_after",
        {
            transaction: transaction
        }
    ]
}
```

### Data environments

A `.env` file variable of `DATA_ENV=unverified` can be set. What does this do?

- It allows a user with `username` of `admin` to by-pass purchasing data and just see all datapoints available for that year, rendered on the chart.
- Company DB lookup (ie the ID) will correspond to the master `Company` table and not the transformed (ie verified) `IndexedCompany` table
- However, all datapoints will be shown from `IndexedEdisonOrders` regardless, since at least one transform of the raw data is what we are needing to check

So, we use the above to enable someone to verify company data, before marking the `Company` as `verified` which in turn sets it up for populating in the `IndexedCompany` table which is what production uses as its record of companies, and what is synced to `_prod` ES index. 

Remember to restart the server when enabling or disabling for this to take effect ;)

Note the ES index being looked up, is set from the [front-end repo](https://github.com/gregorvand/ellen-vue) ENV variables.

---


## Running / accessing container-based redis on DO 
### (legacy - we use Google Cloud Run now)
To run a redis container run:

`sudo docker run --name my-redis-container -p 7001:6379 -d redis`

This exposes redis on DO server IP at port 7001, and 'locally' at port 6379

To get the docker container's local IP run:

`docker inspect [container id] | grep IPAddress`

Use the address provided as the `redis://` connect address for production with port `6379`


----
## Maintainers / Support

Contact [gregorvand](https://github.com/gregorvand) for help with anything / [gregor@ellen.me](mailto:gregor@ellen.me)
