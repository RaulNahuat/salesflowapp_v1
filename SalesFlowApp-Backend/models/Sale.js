export default (sequelize, DataTypes) => {
    return sequelize.define('Sale', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'delivered', 'cancelled'),
            defaultValue: 'pending'
        },
        uuidTicket: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true
        },
        paymentMethod: {
            type: DataTypes.STRING
        },
        deliveryPoint: {
            type: DataTypes.STRING
        },
        deliveryDate: {
            type: DataTypes.DATE
        },
        notes: {
            type: DataTypes.TEXT
        },
        receiptTokenId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        SellerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'businessmembers',
                key: 'id'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'sales',
        timestamps: true,
        paranoid: true
    });
};