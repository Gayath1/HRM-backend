'use strict';

const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

const { to } = require('../utils/helpers');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Status, {
        foreignKey: 'statusId'
      });

      User.belongsToMany(models.Organization, {
        through: 'OrganizationUsers',
        as: 'organizations',
        foreignKey: 'userId',
        otherKey: 'organizationId'
      });
    }
  };
  
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'The email is already in use'
      },
      validate: {
        isEmail: {
          msg: 'The email should be of a valid format'
        },
        notNull: {
          msg: 'The email should not be empty'
        },
        notEmpty: {
          msg: 'The email should not be empty'
        }
      }
    },
    mobile: DataTypes.STRING,
    statusId: DataTypes.INTEGER,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'The password should not be empty'
        },
        notEmpty: {
          msg: 'The password should not be empty'
        },
        min: {
          args: 8,
          msg: 'The password should be atleast 8 characters long'
        },
        min: {
          args: 200,
          msg: 'The password should be less than 200 characters long'
        }
      }
    },
    passwordConfirm: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'The password confirmation should not be empty'
        },
        notEmpty: {
          msg: 'The password confirmation should not be empty'
        },
        isEqualToPassword(value) {
          if (value !== this.password) {
            throw new Error('Password confirmation does not match')
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user, options) => {
        let err, hashedPassword;
        [err, hashedPassword] = await to(bcrypt.hash(user.password, 10));

        if (err) {
          return Promise.reject(new Error('Sorry, something went wrong'));
        }

        user.password = hashedPassword;
      }
    }
  });

  return User;
};