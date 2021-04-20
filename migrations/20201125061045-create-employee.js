'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      rfid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      organizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id',
          as: 'organizationId'
        }
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
    await queryInterface.addIndex('Employees', ['rfid'], {
      fields: ['rfid'],
      unique: {
        args: true,
        msg: 'The RFID is already in use'
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Employees');
  }
};