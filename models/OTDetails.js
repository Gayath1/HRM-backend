'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OTDetails.belongsTo(models.EmployeeType, {
        foreignKey: 'employeeTypeId',
        as: 'employeeType'
      });

     

    }
  };
  OTDetails.init({
    
    employeeTypeId: DataTypes.INTEGER, 
    otHrsMax: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    otHrsMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    incharge_email: {
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
    otRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Have to add time schedule of the Start and End time of the shift
    
  }, {
    sequelize,
    modelName: 'OTDetails',
  });
  return OTDetails;
};