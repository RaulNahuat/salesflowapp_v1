import React from 'react';
import ProductList from '../../componentes/products/ProductList';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
    const navigate = useNavigate();

    const handleEdit = (product) => {
        navigate(`/products/edit/${product.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
                <p className="text-gray-600">Administra tu inventario y precios</p>
            </div>
            <ProductList onEdit={handleEdit} />
        </div>
    );
};

export default ProductsPage;
