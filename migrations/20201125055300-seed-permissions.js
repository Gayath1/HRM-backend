'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
      {
        id: 1,
        name: 'Owner',
        description: 'Unrestricted access to manage the organization.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 50,
        name: 'Manager',
        description: 'Manager',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 80,
        name: 'Billing',
        description: 'Access to billing only.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', {
      [Op.or]: [
        { id: 1 },
        { id: 50 },
        { id: 80 },
      ],
    })
  }
};
