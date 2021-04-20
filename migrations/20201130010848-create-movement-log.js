'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MovementLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Devices',
          key: 'id',
          as: 'deviceId'
        }
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Employees',
          key: 'id',
          as: 'employeeId'
        }
      },
      temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      entry: {
        type: Sequelize.BOOLEAN
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MovementLogs');
  }
};