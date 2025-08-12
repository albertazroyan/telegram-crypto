import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      comment: 'Telegram user ID',
    },
    is_bot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    is_premium: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
    ],
  });

  User.associate = (models) => {
    // Add associations here if needed
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    // Remove sensitive information
    delete values.created_at;
    delete values.updated_at;
    return values;
  };

  return User;
};
