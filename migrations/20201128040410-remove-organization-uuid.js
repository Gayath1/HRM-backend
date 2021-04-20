'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Organizations', ['uuid'])
    .then(async () => {
      await queryInterface.removeColumn('Organizations', 'uuid');
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Organizations', 'uuid', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true
    })
    .then(async () => {
      await queryInterface.addIndex('Organizations', ['uuid'])
    });
  }
};
