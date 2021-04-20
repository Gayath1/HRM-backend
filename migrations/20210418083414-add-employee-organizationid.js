'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('EmployeeType', 'organizationId', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('EmployeeType', 'organizationId');
  }
};
