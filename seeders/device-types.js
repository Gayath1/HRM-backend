'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('DeviceTypes', [
      {
        name: 'Temperature Recorder',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Card Reader',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('DeviceTypes', null, {})
  }
};
