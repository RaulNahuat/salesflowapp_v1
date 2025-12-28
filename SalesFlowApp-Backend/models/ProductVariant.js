export default (sequelize, DataTypes) => {
    return sequelize.define('ProductVariant', {
        id: {
            type: DataTypes.UUID, defaultValue:
                DataTypes.UUIDV4, primaryKey: true
        },
        color: {
            type: DataTypes.STRING
        },
        size: {
            type: DataTypes.STRING
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sku: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        paranoid: true
    });
};