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
        phone: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.TEXT
        },
        returnPolicy: {
            type: DataTypes.TEXT
        },
        weekStartDay: {
            type: DataTypes.INTEGER,
            defaultValue: 1, // Monday
            validate: {
                min: 0,
                max: 6
            }
        },
        liveDays: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        settings: {
            type: DataTypes.JSON
        }
    }, { paranoid: true });
};