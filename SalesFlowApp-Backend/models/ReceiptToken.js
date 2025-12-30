export default (sequelize, DataTypes) => {
    return sequelize.define('ReceiptToken', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        parameters: {
            type: DataTypes.JSON, // Stores { clientName: '...', sales: [...] } or filter criteria
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};
