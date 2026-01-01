import db from '../models/index.js';

const Product = db.Product;
const Sale = db.Sale;
const Client = db.Client;
const Raffle = db.Raffle;

export const getDashboardStats = async (req, res) => {
    try {
        const businessId = req.businessId;

        // Count Products
        const productCount = await Product.count({
            where: { BusinessId: businessId }
        });

        // Count Clients
        const clientCount = await Client.count({
            where: { BusinessId: businessId }
        });

        // Build where clause for sales
        const saleWhere = { BusinessId: businessId };
        if (req.user.role === 'employee' && req.user.businessMemberId) {
            saleWhere.SellerId = req.user.businessMemberId;
        }

        // Sum Sales for Today (or total for now as MVP)
        // For complex queries ideally we use Op.between for timestamps. 
        // For MVP let's just count total sales.
        const saleCount = await Sale.count({
            where: saleWhere
        });

        // Calculate Total Revenue (optional, if Sale has total)
        const totalRevenue = await Sale.sum('total', {
            where: saleWhere
        }) || 0;

        // Count Active Raffles
        const raffleCount = await Raffle.count({
            where: { BusinessId: businessId, status: 'active' }
        });

        res.json({
            productCount,
            saleCount,
            totalRevenue,
            raffleCount,
            clientCount
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error al obtener estadísticas del dashboard" });
    }
};
