'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OTDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employeeType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      otHrsMax: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      otHrsMin: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      otRate: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
      },
    
      incharge_email: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('OTDetails');
  }
};