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
        imageUrl: '',
        variants: []
    });
    const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: '', sku: '' });
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
                        imageUrl: data.imageUrl || '',
                        variants: data.ProductVariants || []
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

    const addVariant = () => {
        if (!newVariant.size && !newVariant.color) return toast.error('Ingresa talla o color');
        if (!newVariant.stock) return toast.error('Ingresa el stock de la variante');

        setProduct(prev => {
            const updatedVariants = [...(prev.variants || []), newVariant];
            const totalStock = updatedVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
            return {
                ...prev,
                variants: updatedVariants,
                stock: totalStock
            };
        });
        setNewVariant({ size: '', color: '', stock: '', sku: '' });
    };

    const removeVariant = (index) => {
        setProduct(prev => {
            const updatedVariants = prev.variants.filter((_, i) => i !== index);
            const totalStock = updatedVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
            return {
                ...prev,
                variants: updatedVariants,
                stock: updatedVariants.length > 0 ? totalStock : prev.stock
            };
        });
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
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isEditMode ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto'}
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all w-full sm:w-auto"
                    >
                        <FaArrowLeft /> Volver
                    </Link>
                </div>
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
                            Stock {product.variants && product.variants.length > 0 && (
                                <span className="text-blue-600 font-normal text-xs ml-2">
                                    (Calculado automáticamente: {product.stock} unidades)
                                </span>
                            )}
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
                                className={`w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium ${product.variants && product.variants.length > 0
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-50 text-gray-700 focus:bg-white'
                                    }`}
                                placeholder={product.variants && product.variants.length > 0 ? "Se calcula desde variantes" : "0"}
                                required={!product.variants || product.variants.length === 0}
                                disabled={product.variants && product.variants.length > 0}
                            />
                        </div>
                        {product.variants && product.variants.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <span>ℹ️</span>
                                El stock se calcula sumando todas las variantes
                            </p>
                        )}
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

                {/* Variantes (Tallas y Colores) */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaTag className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                Variantes (Opcional)
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                <strong>¿Tu producto tiene tallas, colores o presentaciones?</strong><br />
                                Agrega variantes para controlar el stock de cada una por separado.
                                El stock total se calculará automáticamente.
                            </p>
                        </div>
                    </div>

                    {product.variants && product.variants.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg mb-4 border border-blue-200">
                            <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                Stock total: {product.stock} unidades distribuidas en {product.variants.length} variante(s)
                            </p>
                        </div>
                    )}

                    {/* Lista de Variantes */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-sm text-left bg-white">
                                <thead className="bg-gray-100 text-gray-700 font-semibold">
                                    <tr>
                                        <th className="px-4 py-2">Talla/Medida</th>
                                        <th className="px-4 py-2">Color/Tipo</th>
                                        <th className="px-4 py-2">SKU</th>
                                        <th className="px-4 py-2 text-center">Stock</th>
                                        <th className="px-4 py-2 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {product.variants.map((v, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">{v.size}</td>
                                            <td className="px-4 py-2">{v.color}</td>
                                            <td className="px-4 py-2 text-xs text-gray-500">{v.sku || '-'}</td>
                                            <td className="px-4 py-2 text-center font-mono">{v.stock}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(idx)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Agregar Variante */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Talla / Medida</label>
                            <input
                                type="text"
                                placeholder="Ej. M, 32, Grande"
                                value={newVariant.size}
                                onChange={e => setNewVariant({ ...newVariant, size: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Color / Detalle</label>
                            <input
                                type="text"
                                placeholder="Ej. Rojo, Algodón"
                                value={newVariant.color}
                                onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">SKU (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Ej. CAM-M-RJ"
                                value={newVariant.sku}
                                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <div className="w-24">
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={newVariant.stock}
                                onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors h-[38px]"
                        >
                            + Agregar
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Link
                        to="/products"
                        className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-center"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <FaSave /> Guardar Producto
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
