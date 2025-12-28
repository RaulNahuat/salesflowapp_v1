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
        },
        permissions: {
            type: DataTypes.JSON,
            defaultValue: { pos: true, products: false, reports: false, settings: false }
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        timestamps: true,
        paranoid: true
    });
};