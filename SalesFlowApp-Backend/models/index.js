import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Import models
import BusinessModel from './Business.js';
import BusinessMemberModel from './BusinessMember.js';
import PaymentModel from './Payment.js';
import ProductModel from './Product.js';
import ProductImageModel from './ProductImage.js';
import ProductVariantModel from './ProductVariant.js';
import RaffleModel from './Raffle.js';
import RaffleTicketModel from './RaffleTicket.js';
import SaleModel from './Sale.js';
import SaleDetailModel from './SaleDetail.js';
import UserModel from './User.js';
import ClientModel from './Client.js';

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.Business = BusinessModel(sequelize, DataTypes);
db.BusinessMember = BusinessMemberModel(sequelize, DataTypes);
db.Payment = PaymentModel(sequelize, DataTypes);
db.Product = ProductModel(sequelize, DataTypes);
db.ProductImage = ProductImageModel(sequelize, DataTypes);
db.ProductVariant = ProductVariantModel(sequelize, DataTypes);
db.Raffle = RaffleModel(sequelize, DataTypes);
db.RaffleTicket = RaffleTicketModel(sequelize, DataTypes);
db.Sale = SaleModel(sequelize, DataTypes);
db.SaleDetail = SaleDetailModel(sequelize, DataTypes);
db.User = UserModel(sequelize, DataTypes);
db.Client = ClientModel(sequelize, DataTypes);

// --- ASOCIACIONES ---

// Multi-tenancy (Todo pertenece a un Negocio)
db.Business.hasMany(db.Product, { onDelete: 'CASCADE' });
db.Business.hasMany(db.Sale, { onDelete: 'CASCADE' });
db.Business.hasMany(db.Raffle, { onDelete: 'CASCADE' });
db.Business.hasMany(db.BusinessMember, { onDelete: 'CASCADE' });
db.Business.hasMany(db.Client, { onDelete: 'CASCADE' });

// Usuarios y Negocios
db.User.hasMany(db.BusinessMember, { onDelete: 'CASCADE' });
db.BusinessMember.belongsTo(db.User);
db.BusinessMember.belongsTo(db.Business);

// Productos y sus variantes/fotos
db.Product.hasMany(db.ProductVariant, { foreignKey: 'ProductId', onDelete: 'CASCADE' });
db.Product.hasMany(db.ProductImage, { onDelete: 'CASCADE' });
db.ProductVariant.belongsTo(db.Product, { foreignKey: 'ProductId' });
db.ProductImage.belongsTo(db.Product);

// Ventas y Clientes
db.Client.hasMany(db.Sale, { foreignKey: 'clientId', onDelete: 'SET NULL' });
db.Sale.belongsTo(db.Client, { foreignKey: 'clientId' });

// Ventas y Vendedores (BusinessMembers)
db.BusinessMember.hasMany(db.Sale, { foreignKey: 'createdById', onDelete: 'SET NULL' });
db.Sale.belongsTo(db.BusinessMember, { as: 'Seller', foreignKey: 'createdById' });

// Detalles de Venta
db.Sale.hasMany(db.SaleDetail, { onDelete: 'CASCADE' });
db.SaleDetail.belongsTo(db.Sale);
db.SaleDetail.belongsTo(db.Product);
db.SaleDetail.belongsTo(db.ProductVariant);

// Pagos
db.Sale.hasMany(db.Payment, { onDelete: 'CASCADE' });
db.Payment.belongsTo(db.Sale);

// Rifas y Boletos
db.Sale.hasMany(db.RaffleTicket, { as: 'RaffleTickets', foreignKey: 'SaleId', onDelete: 'CASCADE' });
db.Raffle.hasMany(db.RaffleTicket, { foreignKey: 'RaffleId', onDelete: 'CASCADE' });
db.RaffleTicket.belongsTo(db.Raffle, { foreignKey: 'RaffleId' });
db.RaffleTicket.belongsTo(db.Sale, { foreignKey: 'SaleId' });
db.RaffleTicket.belongsTo(db.Client, { as: 'Owner', foreignKey: 'clientId' });

export default db;