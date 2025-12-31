import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productApi from '../../services/productApi';
import { FaSave, FaArrowLeft, FaBox, FaMoneyBillWave, FaSortNumericUp, FaImage, FaTag, FaTrashAlt } from 'react-icons/fa';

/**
 * Optimized Variant Item Component
 * Uses React.memo to prevent unnecessary re-renders when typing in other variants
 */
const VariantItem = React.memo(({ variant, index, onChange, onRemove }) => {
    return (
        <div className="bg-white md:grid md:grid-cols-12 gap-4 items-center p-4 md:px-4 md:py-2 transition-all hover:bg-gray-50 group">
            {/* Mobile Header: Size/Color */}
            <div className="md:hidden flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1 prose-sm">{variant.size || 'S/T'}</div>
                    <div className="text-sm text-gray-500">{variant.color || 'S/C'}</div>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-400 hover:text-red-600 p-2 transition-colors"
                >
                    <FaTrashAlt size={16} />
                </button>
            </div>

            {/* Desktop Column 1: Size */}
            <div className="hidden md:block col-span-3 text-sm font-medium text-gray-700">
                {variant.size || 'S/T'}
            </div>

            {/* Desktop Column 2: Color */}
            <div className="hidden md:block col-span-3 text-sm text-gray-500">
                {variant.color || 'S/C'}
            </div>

            {/* SKU Input */}
            <div className="col-span-12 md:col-span-3 mb-3 md:mb-0">
                <label className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1">SKU</label>
                <input
                    type="text"
                    value={variant.sku || ''}
                    onChange={e => onChange(index, 'sku', e.target.value)}
                    className="w-full px-2 py-1.5 md:py-1 text-sm border border-gray-200 md:border-transparent md:hover:border-gray-300 md:focus:border-blue-500 rounded bg-gray-50 md:bg-transparent focus:bg-white outline-none transition-all"
                    placeholder="Sin SKU"
                />
            </div>

            {/* Stock Input */}
            <div className="col-span-12 md:col-span-2 flex items-center gap-2">
                <label className="md:hidden text-[10px] uppercase font-bold text-gray-400 block mb-1 flex-1">Stock</label>
                <div className="relative flex-1 md:flex-none">
                    <input
                        type="number"
                        value={variant.stock ?? ''}
                        onChange={e => onChange(index, 'stock', e.target.value)}
                        className="w-full md:w-20 px-2 py-1.5 md:py-1 text-center font-mono text-sm border border-gray-200 md:border-transparent md:hover:border-gray-300 md:focus:border-blue-500 rounded bg-gray-50 md:bg-transparent focus:bg-white outline-none transition-all"
                    />
                </div>
            </div>

            {/* Delete Button (Desktop only) */}
            <div className="hidden md:flex col-span-1 justify-center">
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-300 hover:text-red-600 p-2 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar variante"
                >
                    <FaTrashAlt size={14} />
                </button>
            </div>
        </div>
    );
});

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
        if (newVariant.stock === '' || newVariant.stock === null) return toast.error('Ingresa el stock de la variante');

        setProduct(prev => {
            const updatedVariants = [...(prev.variants || []), { ...newVariant, stock: parseInt(newVariant.stock) || 0 }];
            const totalStock = updatedVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
            return {
                ...prev,
                variants: updatedVariants,
                stock: totalStock
            };
        });
        setNewVariant({ size: '', color: '', stock: '', sku: '' });
    };

    const handleVariantChange = React.useCallback((index, field, value) => {
        setProduct(prev => {
            const updatedVariants = [...prev.variants];
            updatedVariants[index] = { ...updatedVariants[index], [field]: value };

            let newState = { ...prev, variants: updatedVariants };
            if (field === 'stock') {
                const totalStock = updatedVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
                newState.stock = totalStock;
            }
            return newState;
        });
    }, []);

    const removeVariant = React.useCallback((index) => {
        setProduct(prev => {
            const updatedVariants = prev.variants.filter((_, i) => i !== index);
            const totalStock = updatedVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
            return {
                ...prev,
                variants: updatedVariants,
                stock: updatedVariants.length > 0 ? totalStock : prev.stock
            };
        });
    }, []);

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
            let msg = 'Error al guardar el producto';

            // Handle specific error types
            if (err.status === 403) {
                msg = `❌ Permiso denegado: ${err.message}. Contacta al propietario del negocio para obtener los permisos necesarios.`;
            } else if (err.status === 400) {
                msg = `⚠️ Validación: ${err.message}`;
            } else {
                msg = err.message || msg;
            }

            setError(msg);
            toast.error(msg, { duration: 5000 });
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
                        <div className="mb-4">
                            {/* Header (Desktop only) */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded-t-lg border-x border-t border-gray-200">
                                <div className="col-span-3">Talla/Medida</div>
                                <div className="col-span-3">Color/Tipo</div>
                                <div className="col-span-3">SKU</div>
                                <div className="col-span-2 text-center">Stock</div>
                                <div className="col-span-1 text-center">Acción</div>
                            </div>

                            <div className="md:border md:border-gray-200 md:rounded-b-lg md:overflow-hidden md:bg-white divide-y divide-gray-100 space-y-3 md:space-y-0">
                                {product.variants.map((v, idx) => (
                                    <VariantItem
                                        key={v.id || `new-${idx}`}
                                        variant={v}
                                        index={idx}
                                        onChange={handleVariantChange}
                                        onRemove={removeVariant}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agregar Variante - Improved Mobile Layout */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">Talla / Medida</label>
                                <input
                                    type="text"
                                    placeholder="Ej. M, 32, Grande"
                                    value={newVariant.size}
                                    onChange={e => setNewVariant({ ...newVariant, size: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">Color / Detalle</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Rojo, Algodón"
                                    value={newVariant.color}
                                    onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="col-span-1 sm:col-span-2">
                                <label className="text-xs font-bold text-gray-600 mb-1 block">SKU (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ej. CAM-M-RJ"
                                    value={newVariant.sku}
                                    onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">Stock</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={newVariant.stock}
                                    onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            + Agregar Variante
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
