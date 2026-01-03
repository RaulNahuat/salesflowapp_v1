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
            allowNull: true, // Allow null for deleted users
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true // Allow null for deleted users
        },
        password: { type: DataTypes.STRING }
    }, {
        tableName: 'users',
        timestamps: true,
        paranoid: true, // Enables soft delete (deletedAt column)
        indexes: [
            {
                unique: true,
                fields: ['email'],
                name: 'users_email_unique'
            },
            {
                unique: true,
                fields: ['phone'],
                name: 'users_phone_unique'
            }
        ]
        // Note: On deletion, email and phone are set to NULL to allow reuse
        // This is handled by the beforeDestroy hook below
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

    // Clear email and phone on soft delete to allow reuse
    const clearUniqueFields = async (user) => {
        // Generate unique suffix using timestamp to avoid conflicts
        const timestamp = Date.now();
        await user.update({
            email: `deleted_${timestamp}_${user.email}`,
            phone: `deleted_${timestamp}_${user.phone}`
        }, {
            paranoid: false // Allow update even though we're deleting
        });
    };

    User.beforeCreate(hashPassword);
    User.beforeUpdate(hashPassword);
    User.beforeDestroy(clearUniqueFields);

    return User;
};