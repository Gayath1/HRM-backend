'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Locations', 'count', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Locations', 'count');
  }
};
