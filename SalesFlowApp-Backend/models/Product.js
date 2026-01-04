export default (sequelize, DataTypes) => {
    return sequelize.define('Product', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        costPrice: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        sellingPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'products',
        timestamps: true,
        paranoid: true
    });
};