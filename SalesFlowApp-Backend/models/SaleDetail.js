export default (sequelize, DataTypes) => {
    return sequelize.define('SaleDetail', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    });
};