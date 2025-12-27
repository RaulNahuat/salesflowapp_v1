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
        }
    });
};