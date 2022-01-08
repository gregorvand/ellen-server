module.exports = (sequelize, DataTypes) => {
  const edison_receipts_monthly_calc = sequelize.define(
    'edison_receipts_monthly_calc',
    {
      merchant_name: {
        type: DataTypes.STRING,
      },
      user_id: {
        type: DataTypes.STRING,
      },
      order_number: {
        type: DataTypes.STRING,
      },
      order_time: {
        type: DataTypes.STRING,
      },
      email_time: {
        type: DataTypes.STRING,
      },
      update_time: {
        type: DataTypes.STRING,
      },
      insert_time: {
        type: DataTypes.STRING,
      },
      order_pickup: {
        type: DataTypes.SMALLINT,
      },
      order_total_amount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_shipping: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_tax: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_subtotal: {
        type: DataTypes.STRING,
      },
      order_total_qty: {
        type: DataTypes.SMALLINT,
      },
      item_description: {
        type: DataTypes.STRING(500),
      },
      item_subtitle: {
        type: DataTypes.STRING(500),
      },
      item_quantity: {
        type: DataTypes.SMALLINT,
      },
      item_price: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      checksum: {
        type: DataTypes.STRING,
      },
      item_reseller: {
        type: DataTypes.STRING,
      },
      from_domain: {
        type: DataTypes.STRING,
      },
      email_subject: {
        type: DataTypes.STRING,
      },
    }
  )
  return edison_receipts_monthly_calc
}
