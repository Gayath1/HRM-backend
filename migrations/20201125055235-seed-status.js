'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Statuses', [
      {
        id: 1,
        key: 'active',
        name: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 50,
        key: 'pending',
        name: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 90,
        key: 'deleted',
        name: 'Deleted',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Statuses', {
      [Op.or]: [
        { id: 1 },
        { id: 50 },
        { id: 90 },
      ],
    })
  }
};
