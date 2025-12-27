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
            unique: true
        },
        phone: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: { type: DataTypes.STRING }
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