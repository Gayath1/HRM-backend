'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTReviewStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OTReviewStatus.hasMany(models.OTLogs, {
        as: 'OTLogs',
        foreignKey: 'reviewstatusId'
      });
    }
  };
  OTReviewStatus.init({
    key: DataTypes.STRING,
    reviewStatusName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OTReviewStatus',
  });
  return OTReviewStatus;
};