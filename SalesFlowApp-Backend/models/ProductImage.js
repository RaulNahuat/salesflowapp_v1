export default (sequelize, DataTypes) => {
    return sequelize.define('ProductImage', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        paranoid: true
    });
};