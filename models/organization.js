'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Organization.belongsToMany(models.User, {
        through: 'OrganizationUsers',
        as: 'users',
        foreignKey: 'organizationId',
        otherKey: 'userId'
      });

      Organization.hasMany(models.Employee, {
        foreignKey: 'organizationId',
        as: 'employees'
      });

      Organization.hasMany(models.Device, {
        foreignKey: 'organizationId',
        as: 'devices'
      });

      Organization.hasMany(models.Location, {
        foreignKey: 'organizationId',
        as: 'locations'
      });

      Organization.hasMany(models.Shift, {
        foreignKey: 'organizationId',
        as: 'shift'
      });
      Organization.hasMany(models.OTDetails, {
        foreignKey: 'organizationId',
        as: 'OTDetails'
      });
      Organization.hasMany(models.EmployeeType, {
        foreignKey: 'organizationId',
        as: 'employeeTypes'
      });
    }
  };
  Organization.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Organization',
  });
  return Organization;
};