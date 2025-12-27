export default (sequelize, DataTypes) => {
    return sequelize.define('BusinessMember', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        role: {
            type: DataTypes.ENUM('owner', 'employee', 'customer'),
            defaultValue: 'customer'
        },
        accessToken: {
            type: DataTypes.STRING,
            unique: true
        },
        localAlias: {
            type: DataTypes.STRING,
            unique: true
        }
    });
};