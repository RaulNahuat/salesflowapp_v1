import { sequelize } from './config/db.js';
import { DataTypes } from 'sequelize';

const addTimestamps = async () => {
    try {
        const queryInterface = sequelize.getQueryInterface();

        console.log('Checking Sales table...');
        const table = await queryInterface.describeTable('Sales');

        if (!table.createdAt) {
            console.log('Adding createdAt column...');
            await queryInterface.addColumn('Sales', 'createdAt', {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            });
        }

        if (!table.updatedAt) {
            console.log('Adding updatedAt column...');
            await queryInterface.addColumn('Sales', 'updatedAt', {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            });
        }

        console.log('Timestamps added successfully!');
    } catch (error) {
        console.error('Error adding timestamps:', error);
    } finally {
        await sequelize.close();
    }
};

addTimestamps();
