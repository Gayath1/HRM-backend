'use strict';

const { Op } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Statuses', [
      {
        id: 100,
        key: 'exited',
        name: 'Exited',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 101,
        key: 'entered',
        name: 'Entered',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 102,
        key: 'held',
        name: 'Held',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Statuses', {
      [Op.or]: [
        { id: 100 },
        { id: 101 },
        { id: 102 },
      ],
    })
  }
};
