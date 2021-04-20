'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Employees', 'EmployeeType', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Employees', 'EmployeeType');
  }
};