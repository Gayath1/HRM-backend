'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'statusId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Statuses',
        key: 'id',
        as: 'statusId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'statusId');
  }
};
