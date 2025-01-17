-- finds unique order numbers, only showing the earlist record --
-- And filters on only order numbers that are 'whole numbers' ie no '-' or letters
select
  distinct on ("orderNumber") *
from
  public."EdisonOrders"
where
  "fromDomain" = 'support@fragrantjewels.com'
  and "orderNumber" ~ '^\d+$'
order by
  "orderNumber",
  "emailDate"
-- finds unique order numbers, only showing the earlist record --
-- with date filtering
-- also returns results in format of orderNumber / emailDate columns only, with renamed columns
-- And filters on only order numbers that are 'whole numbers' ie no '-' or letters
select
  distinct on ("orderNumber") "orderNumber" "y",
  "emailDate" "t"
from
  public."EdisonOrders"
where
  "fromDomain" = '${req.body.companyEmail}'
  and "orderNumber" ~ '^\\d+$'
  and "emailDate" between '${req.body.dateStart}' :: timestamp
  and '${req.body.dateEnd}' :: timestamp
order by
  "orderNumber",
  "emailDate"
-- Override date value if older
INSERT INTO
  public."EdisonOrderIndexeds" (
    "orderNumber",
    "emailDate",
    "fromDomain",
    "createdAt",
    "updatedAt"
  )
VALUES
  (
    '1111002',
    '2017-01-01',
    'gregor@vand.hk',
    NOW(),
    NOW()
  ) ON CONFLICT ("orderNumber") DO
UPDATE
SET
  "emailDate" = excluded."emailDate"
WHERE
  excluded."emailDate" < "EdisonOrderIndexeds"."emailDate"