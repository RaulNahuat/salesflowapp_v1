export default (sequelize, DataTypes) => {
    return sequelize.define('ProductImage', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'productimages',
        timestamps: true,
        paranoid: true
    });
};