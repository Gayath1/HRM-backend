'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Employees', 'employeeTypeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'EmployeeType',
        key: 'id',
        as: 'employeeTypeId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Employees', 'employeeTypeId');
  }
};
