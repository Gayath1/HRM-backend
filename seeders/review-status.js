'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('ReviewStatuses', [
      {
        reviewStatusName: 'Accepted',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewStatusName: 'Declined',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewStatusName: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ReviewStatuses', null, {})
  }
};