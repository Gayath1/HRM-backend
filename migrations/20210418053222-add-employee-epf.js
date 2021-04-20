'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Employees', 'epf', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Employees', 'epf');
  }
};
