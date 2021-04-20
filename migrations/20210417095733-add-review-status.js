'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OTLogs', 'reviewstatusId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'ReviewStatuses',
        key: 'id',
        as: 'reviewstatusId'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OTLogs', 'reviewstatusId');
  }
};
