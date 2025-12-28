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
        ticketPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Amount needed to earn 1 ticket'
        },
        drawDate: {
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.ENUM('active', 'finished'),
            defaultValue: 'active'
        },
        drawCriteria: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: 'Which draw attempt wins (e.g. 3 = the 3rd ticket drawn wins)'
        },
        prizes: {
            type: DataTypes.JSON,
            defaultValue: null,
            comment: 'Object with prizes for 1st, 2nd, 3rd place'
        }
    }, {
        timestamps: true,
        paranoid: true
    });
};