'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Shift', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shiftName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      ot_startTime: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    
      start_time: {
        type: Sequelize.STRING,
      },
      end_time: {
        type: Sequelize.STRING,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('Shift', ['shiftName'], {
      fields: ['shiftName'],
      unique: {
        args: true,
        msg: 'The shift is already created.'
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Shift');
  }
};