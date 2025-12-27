import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../componentes/products/ProductForm';
import { getProduct } from '../../services/productApi';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const data = await getProduct(id);
                    setInitialData(data); // Assuming data is the product object
                } catch (error) {
                    console.error("Error fetching product:", error);
                    alert("Error al cargar el producto");
                    navigate('/products');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, navigate]);

    if (id && loading) {
        return <div className="text-center p-10">Cargando datos...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button onClick={() => navigate('/products')} className="text-indigo-600 hover:underline mb-2">&larr; Volver al inventario</button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {id ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h1>
            </div>
            <ProductForm
                initialData={initialData}
                onSuccess={() => navigate('/products')}
                onCancel={() => navigate('/products')}
            />
        </div>
    );
};

export default ProductFormPage;
