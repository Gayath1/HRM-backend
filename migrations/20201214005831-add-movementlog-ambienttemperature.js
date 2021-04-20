'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MovementLogs', 'ambientTemperature', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('MovementLogs', 'ambientTemperature');
  }
};
