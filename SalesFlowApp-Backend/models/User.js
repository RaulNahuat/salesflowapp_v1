import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        firstName: { type: DataTypes.STRING },
        lastName: { type: DataTypes.STRING },
        email: {
            type: DataTypes.STRING,
            // Uniqueness enforced by partial index at database level (users_email_active_unique)
            // Allows email reuse after account deletion (soft delete)
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            // Uniqueness enforced by partial index at database level (users_phone_active_unique)
            // Allows phone reuse after account deletion (soft delete)
        },
        password: { type: DataTypes.STRING }
    }, {
        tableName: 'users',
        timestamps: true,
        paranoid: true
        // Note: Partial uniqueness for phone/email is handled at the DB level 
        // using virtual columns and unique indexes (see migrations/quick_migration.sql)
        // to ensure compatibility with MySQL 5.7+ / 8.0
    });

    User.prototype.comparePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };
    const hashPassword = async (user) => {
        if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    };

    User.beforeCreate(hashPassword);
    User.beforeUpdate(hashPassword);

    return User;
};