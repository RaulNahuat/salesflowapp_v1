export default (sequelize, DataTypes) => {
    return sequelize.define('Raffle', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        motive: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prize: {
            type: DataTypes.STRING
        },
        drawDate: {
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.ENUM('active', 'finished'),
            defaultValue: 'active'
        },
        BusinessId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        ticketPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 100.00
        },
        drawCriteria: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        prizes: {
            type: DataTypes.JSON,
            defaultValue: []
        }
    }, {
        tableName: 'raffles',
        timestamps: true,
        paranoid: true
    });
};