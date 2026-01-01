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
            allowNull: false,
            unique: true
        },
        logoURL: {
            type: DataTypes.STRING
        },
        settings: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        phone: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        address: { type: DataTypes.TEXT },
        returnPolicy: { type: DataTypes.TEXT },
        weekStartDay: {
            type: DataTypes.INTEGER,
            defaultValue: 1 // 1 for Monday
        },
        liveDays: {
            type: DataTypes.JSON, // Array of days [1, 2, 3, 4, 5, 6, 0]
            defaultValue: [1, 2, 3, 4, 5, 6, 0]
        }
    }, {
        tableName: 'businesses',
        timestamps: false
    });
};