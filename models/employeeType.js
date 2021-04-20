'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EmployeeType.hasMany(models.Employee, {
        as: 'employeeType',
        foreignKey: 'id'
      });
      EmployeeType.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
      });
    }
  };
  EmployeeType.init({
    organizationId: DataTypes.INTEGER,
    key: DataTypes.STRING,
    Employee_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmployeeType',
  });
  return EmployeeType;
};