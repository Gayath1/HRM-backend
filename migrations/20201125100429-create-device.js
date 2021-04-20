'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID
      },
      statusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Statuses',
          key: 'id',
          as: 'statusId'
        }
      },
      deviceTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'DeviceTypes',
          key: 'id',
          as: 'deviceTypeId'
        }
      },
      organizationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Organizations',
          key: 'id',
          as: 'organizationId'
        }
      },
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Locations',
          key: 'id',
          as: 'locationId'
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Devices');
  }
};