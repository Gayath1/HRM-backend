'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Shift', 'employeeid');
    await queryInterface.addColumn('Shift', 'employeeTypeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'EmployeeType',
        key: 'id',
        as: 'employeeTypeId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Shift', 'employeeTypeId');
  }
};
