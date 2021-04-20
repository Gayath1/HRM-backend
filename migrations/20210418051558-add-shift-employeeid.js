'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Shift', 'employeeid', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Employees',
        key: 'id',
        as: 'employeeId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Shift', 'employeeid');
  }
};
