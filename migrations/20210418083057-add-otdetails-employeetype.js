'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OTDetails', 'employeeType');
    await queryInterface.addColumn('OTDetails', 'employeeTypeId', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OTDetails', 'employeeTypeId');
  }
};
