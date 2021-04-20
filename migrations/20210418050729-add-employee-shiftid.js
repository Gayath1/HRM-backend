'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Employees', 'shiftId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Shift',
        key: 'id',
        as: 'shiftId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Employees', 'shiftId');
  }
};
