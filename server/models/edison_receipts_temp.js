module.exports = (sequelize, DataTypes) => {
  const edison_receipts_temp = sequelize.define('edison_receipts_temp', {
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
  })

  return edison_receipts_temp
}
