'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OTLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employeeTypeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'EmployeeType',
          key: 'id',
          as: 'employeeTypeId'
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
      shiftId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Shift',
          key: 'id',
          as: 'shiftId'
        }
      },
      OTHrs: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: true
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
    await queryInterface.dropTable('OTLogs');
  }
};

//changes