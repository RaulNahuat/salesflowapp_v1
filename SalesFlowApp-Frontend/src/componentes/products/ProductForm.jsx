import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productApi from '../../services/productApi';
import { FaSave, FaArrowLeft, FaBox, FaMoneyBillWave, FaSortNumericUp, FaImage, FaTag } from 'react-icons/fa';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [product, setProduct] = useState({
        name: '',
        description: '',
        costPrice: '',
        sellingPrice: '',
        stock: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await productApi.getProduct(id);
                    setProduct({
                        name: data.name || '',
                        description: data.description || '',
                        costPrice: data.costPrice || '',
                        sellingPrice: data.sellingPrice || '',
                        stock: data.stock || '',
                        imageUrl: data.imageUrl || ''
                    });
                } catch (err) {
                    setError('Error al cargar el producto para editar');
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                await productApi.updateProduct(id, product);
                toast.success('Producto actualizado correctamente');
            } else {
                await productApi.createProduct(product);
                toast.success('Producto creado correctamente');
            }
            navigate('/products');
        } catch (err) {
            const msg = err.message || 'Error al guardar el producto';
            setError(msg);
            toast.error(msg);
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                    <FaArrowLeft className="mr-2" /> Volver al inventario
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode ? 'Actualiza los detalles del producto.' : 'Ingresa la información básica de tu producto.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                        Nombre del Producto
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaBox className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="Ej. Camiseta Básica"
                            required
                        />
                    </div>
                </div>

                {/* Precios y Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="costPrice">
                            Costo ($) <span className="text-gray-400 font-normal text-xs">(Opcional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaTag className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                step="0.01"
                                value={product.costPrice}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="sellingPrice">
                            Precio de Venta ($)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaMoneyBillWave className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                step="0.01"
                                value={product.sellingPrice}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="stock">
                            Stock Inicial
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaSortNumericUp className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={product.stock}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 min-h-[100px]"
                        placeholder="Detalles adicionales del producto..."
                    />
                </div>

                {/* Imagen URL */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="imageUrl">
                        URL de Imagen (Opcional)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaImage className="text-gray-400" />
                        </div>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            value={product.imageUrl}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link
                        to="/products"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <FaSave className="mr-2" /> Guardar Producto
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
