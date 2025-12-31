import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import productApi from '../../services/productApi';
import {
    FaBox,
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaExclamationTriangle,
    FaRegListAlt,
    FaLayerGroup,
    FaArrowRight,
    FaEllipsisV,
    FaBoxes
} from 'react-icons/fa';
import ConfirmationModal from '../ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null });
    const location = useLocation();

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar productos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (location.key !== 'default') {
            fetchProducts();
        }
    }, [location.key, fetchProducts]);

    const confirmDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Producto',
            message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
            isDatgerous: true,
            confirmText: 'Eliminar Producto',
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
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando Inventario...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-fade-up">
            {/* 1. Slim Header - Vibrant Style */}
            <div className="relative overflow-hidden bg-vibrant rounded-3xl p-6 mb-6 shadow-vibrant">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Inventario de Productos</h1>
                        <p className="text-[10px] font-medium text-blue-100/80 uppercase tracking-widest mt-0.5">Administra stock, precios y categorías</p>
                    </div>
                    <Link
                        to="/products/new"
                        className="bg-white text-blue-600 flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-lg shadow-black/5"
                    >
                        <FaPlus size={10} />
                        <span>Nuevo Producto</span>
                    </Link>
                </div>
            </div>

            {/* 2. Compact Search */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                        <FaSearch size={14} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, categoría o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[2rem] flex items-center animate-fade-up">
                    <FaExclamationTriangle className="mr-4 text-rose-500" size={24} />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Empty States */}
            {!loading && products.length === 0 && !error && (
                <div className="bg-white rounded-3xl border border-slate-100 py-20 flex flex-col items-center text-center px-10 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                        <FaBox className="text-slate-300 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Tu almacén está vacío</h3>
                    <p className="text-slate-400 text-xs max-w-sm mb-6 font-medium">Registra productos para comenzar a vender.</p>
                    <Link to="/products/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Crear Producto</Link>
                </div>
            )}

            {/* 3. List Content (Ultra-Compact) */}
            <div className="space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-1 opacity-40">
                    <div className="col-span-12 md:col-span-5 text-[8px] font-bold text-slate-500 uppercase tracking-widest font-sans">Producto / Identidad</div>
                    <div className="col-span-12 md:col-span-4 text-[8px] font-bold text-slate-500 uppercase tracking-widest font-sans">Comercial</div>
                    <div className="col-span-12 md:col-span-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right font-sans">Gestionar</div>
                </div>
                <div className="space-y-2">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 py-3 bg-white border border-slate-100/60 rounded-xl hover:border-blue-200 hover:shadow-soft transition-all items-center group animate-fade-up shadow-sm/30"
                        >
                            <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FaBox size={14} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-tight truncate group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest leading-none">{product.category || 'General'}</p>
                                        <span className="text-[8px] text-slate-200 tracking-tighter">|</span>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">SKU: {product.sku || '---'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-4 flex items-center gap-6">
                                <div className="text-xs font-bold text-slate-800 tracking-tight">
                                    ${parseFloat(product.sellingPrice).toLocaleString('es-MX', { minimumFractionDigits: 1 })}
                                </div>
                                <div className={`px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-widest border ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                    product.stock > 0 ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                        'bg-rose-50 text-rose-600 border-rose-100/50'
                                    }`}>
                                    {product.stock} Dispo
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-1.5">
                                <Link
                                    to={`/products/edit/${product.id}`}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-blue-100"
                                    title="Editar"
                                >
                                    <FaEdit size={12} />
                                </Link>
                                <button
                                    onClick={() => confirmDelete(product.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90 border border-transparent hover:border-rose-100"
                                    title="Eliminar"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {filteredProducts.length === 0 && searchTerm && (
                <div className="py-20 text-center animate-fade-up">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                        <FaSearch size={20} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">No encontramos coincidencias para "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="mt-4 text-sm font-bold text-blue-600 uppercase tracking-widest hover:underline decoration-blue-200 underline-offset-4">Limpiar búsqueda</button>
                </div>
            )}

            {/* Modal Premium */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
                cancelText="Mantener Producto"
            />
        </div>
    );
};

export default ProductList;
