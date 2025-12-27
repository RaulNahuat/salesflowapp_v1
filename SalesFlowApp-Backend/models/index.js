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

// --- ASOCIACIONES ---

// Multi-tenancy (Todo pertenece a un Negocio)
db.Business.hasMany(db.Product);
db.Business.hasMany(db.Sale);
db.Business.hasMany(db.Raffle);
db.Business.hasMany(db.BusinessMember);

// Usuarios y Negocios
db.User.hasMany(db.BusinessMember);
db.BusinessMember.belongsTo(db.User);
db.BusinessMember.belongsTo(db.Business);

// Productos y sus variantes/fotos
db.Product.hasMany(db.ProductVariant);
db.Product.hasMany(db.ProductImage);
db.ProductVariant.belongsTo(db.Product);
db.ProductImage.belongsTo(db.Product);

// Ventas y Clientes
db.User.hasMany(db.Sale, { as: 'Purchases', foreignKey: 'customerId' });
db.Sale.belongsTo(db.User, { as: 'Customer', foreignKey: 'customerId' });

// Detalles de Venta
db.Sale.hasMany(db.SaleDetail);
db.SaleDetail.belongsTo(db.Sale);
db.SaleDetail.belongsTo(db.Product);
db.SaleDetail.belongsTo(db.ProductVariant);

// Pagos
db.Sale.hasMany(db.Payment);
db.Payment.belongsTo(db.Sale);

// Rifas y Boletos
db.Raffle.hasMany(db.RaffleTicket);
db.RaffleTicket.belongsTo(db.Raffle);
db.RaffleTicket.belongsTo(db.Sale);
db.RaffleTicket.belongsTo(db.User, { as: 'Owner', foreignKey: 'customerId' });

export default db;