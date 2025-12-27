import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../../services/productApi';
import { FaBox, FaPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productApi.getProducts();
                setProducts(data);
            } catch (err) {
                setError('Error al cargar productos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const confirmDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Producto',
            message: '¿Estás seguro de que deseas eliminar este producto? Se eliminará del inventario.',
            isDatgerous: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await productApi.deleteProduct(id);
                    setProducts(prev => prev.filter(p => p.id !== id));
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    toast.success('Producto eliminado correctamente');
                } catch (err) {
                    toast.error('No se pudo eliminar el producto');
                }
            }
        });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
                    <p className="text-gray-500 text-sm">Gestiona tus productos y existencias</p>
                </div>
                <Link
                    to="/products/new"
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all"
                >
                    <FaPlus className="mr-2" /> Nuevo Producto
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center">
                    <FaExclamationTriangle className="mr-3 text-red-500" />
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && !error && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FaBox className="text-blue-200 text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Tu inventario está vacío</h3>
                    <p className="text-gray-500 mb-6">Agrega tu primer producto para comenzar a vender.</p>
                    <Link
                        to="/products/new"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Crear Producto ahora &rarr;
                    </Link>
                </div>
            )}

            {/* Product Grid / List */}
            {products.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-right">Precio</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                                                    ) : (
                                                        <FaBox />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock} unids.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ${parseFloat(product.sellingPrice).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Link
                                                    to={`/products/edit/${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => confirmDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && searchTerm && (
                            <div className="p-8 text-center text-gray-500">
                                No se encontraron productos con "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Modal de Confirmación */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
            />
        </div>
    );
};

export default ProductList;
