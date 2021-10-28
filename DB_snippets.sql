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