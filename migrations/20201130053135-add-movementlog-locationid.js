'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MovementLogs', 'locationId', {
      type: Sequelize.INTEGER
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('MovementLogs', 'locationId');
  }
};
