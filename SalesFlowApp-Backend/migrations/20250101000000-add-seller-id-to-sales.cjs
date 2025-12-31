export default {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Sales', 'SellerId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'BusinessMembers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Sales', 'SellerId');
    }
};
