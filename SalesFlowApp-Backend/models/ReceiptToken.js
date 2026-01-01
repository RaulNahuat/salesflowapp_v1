export default (sequelize, DataTypes) => {
    return sequelize.define('ReceiptToken', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        parameters: {
            type: DataTypes.JSON,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        viewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lastViewedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'receipttokens',
        timestamps: false
    });
};
