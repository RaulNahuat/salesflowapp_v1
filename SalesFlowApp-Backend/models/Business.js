export default (sequelize, DataTypes) => {
    return sequelize.define('Business', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        logoURL: {
            type: DataTypes.STRING
        },
        settings: {
            type: DataTypes.JSON
        }
    }, { paranoid: true });
};