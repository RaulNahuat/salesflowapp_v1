export default (sequelize, DataTypes) => {
    return sequelize.define('RaffleTicket', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isWinner: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        RaffleId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        SaleId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        place: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'raffletickets',
        timestamps: true,
        paranoid: true
    });
};