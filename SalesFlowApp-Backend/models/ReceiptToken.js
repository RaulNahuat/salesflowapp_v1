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
        viewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        lastViewedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};
