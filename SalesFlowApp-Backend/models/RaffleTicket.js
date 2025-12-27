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
        }
    });
};