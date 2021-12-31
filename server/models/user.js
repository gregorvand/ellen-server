const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(64),
        is: /^[0-9a-f]{64}$/i,
        allowNull: false,
      },
      identifier: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
      },
      activated: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async function (user) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        },
      },
    }
  )

  User.associate = (models) => {
    User.hasMany(models.Order, {
      foreignKey: 'customerId',
      as: 'orders',
    })
    User.hasMany(models.Point, {
      foreignKey: 'customerId',
      as: 'points',
    })
    User.hasMany(models.CreditTransaction, {
      foreignKey: 'customerId',
      as: 'credits',
    })
    User.hasMany(models.DatasetAccess, {
      foreignKey: 'customerId',
      as: 'datasets',
    })
    User.hasOne(models.Subscription, {
      foreignKey: 'customerId',
      as: 'subscriptions',
    })
    User.belongsToMany(models.Company, { through: 'UserCompanies' })
    User.belongsToMany(models.IndexedCompany, {
      through: 'UserIndexedCompanies',
    })
  }

  User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
  }

  // Adds credit for new users by default if env variable set or > 0
  if (process.env.INTRO_FREE_CREDIT > 0) {
    User.addHook('afterCreate', async (user) => {
      const CreditTransaction = require('./').CreditTransaction
      await CreditTransaction.create({
        value: process.env.INTRO_FREE_CREDIT,
        activated: true,
        method: 'alpha credit',
        customerId: user.dataValues.id,
      })
    })
  }

  return User
}
