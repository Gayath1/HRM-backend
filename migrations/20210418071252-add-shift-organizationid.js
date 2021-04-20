'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Shift', 'organizationId', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Shift', 'organizationId');
  }
};
