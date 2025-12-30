import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaShoppingCart, FaTrash, FaUser, FaMoneyBillWave, FaBoxOpen, FaArrowLeft, FaPlus, FaMinus, FaArrowRight, FaWhatsapp, FaFileInvoiceDollar, FaTicketAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import productApi from '../../services/productApi';
import clientApi from '../../services/clientApi';
import saleApi from '../../services/saleApi';
import businessApi from '../../services/businessApi';
import ConfirmationModal from '../../componentes/ui/ConfirmationModal';

const POSPage = () => {
    // --- STATE ---
    const [step, setStep] = useState(1); // 1: Client Select, 2: POS
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null, onCancel: null });
    const [businessSlug, setBusinessSlug] = useState('');
    const [businessName, setBusinessName] = useState('');

    // Mobile View State: 'products' | 'cart'
    const [activeTab, setActiveTab] = useState('products');

    // --- INITIAL DATA FETCH ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, clientsData, businessData] = await Promise.all([
                    productApi.getProducts(),
                    clientApi.getClients(),
                    businessApi.getBusiness()
                ]);
                setProducts(productsData.filter(p => p.stock > 0));
                setClients(clientsData);
                setBusinessSlug(businessData.slug || '');
                setBusinessName(businessData.name || 'SalesFlow');
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- COMPUTED ---
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    // Helper: Get available stock for a product/variant considering cart
    const getAvailableStock = (productId, variantId = null) => {
        const product = products.find(p => p.id === productId);
        if (!product) return 0;

        // Find quantity already in cart
        const cartItemId = variantId ? `${productId}-${variantId}` : `${productId}`;
        const cartItem = cart.find(item => item.cartItemId === cartItemId);
        const inCart = cartItem ? cartItem.quantity : 0;

        // Get real stock
        let realStock = 0;
        if (variantId) {
            const variant = product.ProductVariants?.find(v => v.id === variantId);
            realStock = variant ? variant.stock : 0;
        } else {
            realStock = product.stock;
        }

        return Math.max(0, realStock - inCart);
    };

    const cartItemCount = useMemo(() => {
        return cart.length;
    }, [cart]);

    // --- ACTIONS ---
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setStep(2);
    };

    const handleCasualClient = () => {
        setSelectedClient({ id: null, firstName: 'Cliente', lastName: 'Casual' });
        setStep(2);
    };

    // Variant Selection State
    const [variantModal, setVariantModal] = useState({ isOpen: false, product: null });

    const addToCart = (product) => {
        // 1. Check if product has variants
        if (product.ProductVariants && product.ProductVariants.length > 0) {
            setVariantModal({ isOpen: true, product });
            return;
        }

        // 2. Normal Add (No variants)
        addItemToCart(product, null);
    };

    const handleVariantSelect = (variant) => {
        if (!variantModal.product) return;

        // Construct a "composite" item for the cart
        const product = variantModal.product;
        addItemToCart(product, variant);
        setVariantModal({ isOpen: false, product: null });
    };

    const addItemToCart = (product, variant) => {
        const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
        const itemName = variant ? `${product.name} (${variant.size || ''} ${variant.color || ''})` : product.name;
        const maxStock = variant ? variant.stock : product.stock;

        const existing = cart.find(item => item.cartItemId === cartItemId);

        if (existing) {
            if (existing.quantity >= maxStock) {
                toast.error(`Stock insuficiente (Max: ${maxStock})`);
                return;
            }
            toast.success('Agregado', { duration: 1000, id: `add-${cartItemId}` });
            setCart(prev => prev.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            toast.success('Agregado', { duration: 1000, id: `new-${cartItemId}` });
            setCart(prev => [...prev, {
                productId: product.id,
                variantId: variant ? variant.id : null,
                cartItemId: cartItemId, // Unique ID for cart
                name: itemName,
                price: parseFloat(product.sellingPrice),
                quantity: 1,
                maxStock: maxStock
            }]);
        }
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const handleUpdateQuantity = (cartItemId, delta) => {
        const item = cart.find(i => i.cartItemId === cartItemId);
        if (!item) return;

        const newQty = item.quantity + delta;

        if (newQty > item.maxStock) {
            toast.error('Stock máximo alcanzado');
            return;
        }
        if (newQty < 1) return;

        setCart(prev => prev.map(i =>
            i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i
        ));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('El carrito está vacío');

        setProcessing(true);
        try {
            const response = await saleApi.createSale({
                items: cart,
                clientId: selectedClient.id,
                paymentMethod: 'cash',
                total: cartTotal,
                notes: 'Venta en POS'
            });

            const tickets = response.earnedTickets || [];
            const receiptToken = response.receiptToken;

            toast.success('¡Venta Exitosa! 🎉', {
                duration: 2000,
                icon: '✅'
            });

            // Build receipt URL if token exists
            let receiptUrl = '';
            if (receiptToken) {
                receiptUrl = businessSlug
                    ? `${window.location.origin}/${businessSlug}/r/${receiptToken}`
                    : `${window.location.origin}/r/${receiptToken}`;
            }

            // Prepare sharing message if there are raffle tickets
            let ticketMsg = "";
            if (tickets.length > 0) {
                ticketMsg = "\n\n🎟️ *¡Felicidades! Ganaste boletos:*";
                tickets.forEach(rt => {
                    ticketMsg += `\n- ${rt.raffleMotive}: *${rt.tickets.join(", ")}*`;
                });
            }

            // WhatsApp message with receipt link
            let whatsappMsg = `*¡Hola ${selectedClient.firstName}!* 👋\n\nTu compra en *${businessName}* ha sido registrada:\nTotal: *${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cartTotal)}*${ticketMsg}`;

            if (receiptUrl) {
                whatsappMsg += `\n\n📄 *Ver tu ticket digital:*\n${receiptUrl}`;
            }

            whatsappMsg += `\n\n¡Gracias por tu preferencia! ✨`;

            // Reset cart
            setCart([]);
            setActiveTab('products');
            setSearchTerm('');

            // Fresh products
            const updatedProds = await productApi.getProducts();
            setProducts(updatedProds.filter(p => p.stock > 0));

            // Custom Success Modal with receipt options
            setModalConfig({
                isOpen: true,
                title: '¡Venta completada!',
                message: (
                    <div className="space-y-4">
                        <p className="text-gray-600">La venta se registró exitosamente.</p>
                        {tickets.length > 0 && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                                <p className="font-bold text-yellow-800 flex items-center gap-2 mb-1">
                                    <FaTicketAlt /> ¡Boletos Generados!
                                </p>
                                {tickets.map((rt, i) => (
                                    <p key={i} className="text-yellow-700">
                                        {rt.raffleMotive}: <strong>{rt.tickets.join(", ")}</strong>
                                    </p>
                                ))}
                            </div>
                        )}
                        {receiptToken && (
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        window.open(receiptUrl, '_blank');
                                    }}
                                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                                >
                                    <FaFileInvoiceDollar className="text-xl" /> Ver Ticket Digital
                                </button>
                                {selectedClient.phone && (
                                    <button
                                        onClick={() => {
                                            const url = `https://wa.me/${selectedClient.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                    >
                                        <FaWhatsapp className="text-xl" /> Compartir Ticket por WhatsApp
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ),
                isDatgerous: false,
                confirmText: 'Siguiente Venta',
                cancelText: 'Cerrar',
                action: () => {
                    // Just close and keep client
                },
                onCancel: () => {
                    setSelectedClient(null);
                    setStep(1);
                }
            });
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al procesar venta');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold">Cargando POS...</div>;

    // --- STEP 1: CLIENT SELECTION ---
    if (step === 1) {
        const filteredClients = clients.filter(c =>
            c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm))
        );

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-start justify-center p-4 pt-8">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Iniciar Venta</h1>
                        <p className="text-gray-600 text-sm">Selecciona un cliente para comenzar</p>
                    </div>

                    {/* Casual Client Button - Compact */}
                    <button
                        onClick={handleCasualClient}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-between group mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <FaUser className="text-xl" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg">Cliente Casual</p>
                                <p className="text-blue-100 text-xs">Venta rápida sin registro</p>
                            </div>
                        </div>
                        <FaArrowRight className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Registered Clients - Larger */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                        {/* Header with counter */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaSearch className="text-blue-500" /> Clientes Registrados
                            </h2>
                            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                {clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nombre, apellido o teléfono..."
                                value={searchTerm}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Results counter */}
                        {searchTerm && (
                            <p className="text-xs text-gray-500 mb-2">
                                {filteredClients.length} {filteredClients.length === 1 ? 'resultado' : 'resultados'}
                            </p>
                        )}

                        {/* Client List - Bigger */}
                        <div className="overflow-y-auto space-y-2 pr-2 max-h-[400px]">
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => handleClientSelect(client)}
                                        className="p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{client.firstName} {client.lastName}</p>
                                                {client.phone && (
                                                    <p className="text-xs text-gray-500">{client.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <FaUser className="mx-auto text-5xl mb-3 opacity-50" />
                                    <p className="font-medium">No se encontraron clientes</p>
                                    <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 2: SPLIT VIEW POS ---
    return (
        <div className="flex h-[calc(100vh-64px)] -m-4 sm:-m-8 bg-gray-100 overflow-hidden relative font-sans">

            {/* --- LEFT PANEL: PRODUCTS (Desktop: 65%, Mobile: Full if Active) --- */}
            <div className={`flex-1 flex flex-col bg-gray-100 transition-all duration-300 ${activeTab === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 shadow-lg z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                                {selectedClient?.firstName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Vendiendo a</p>
                                <p className="font-bold text-white text-lg">{selectedClient?.firstName} {selectedClient?.lastName}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedClient(null);
                                setStep(1);
                                setCart([]);
                            }}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors backdrop-blur-sm"
                        >
                            Cambiar cliente
                        </button>
                    </div>

                    {/* Mobile Tab Toggle */}
                    <div className="lg:hidden flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'cart' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                        >
                            Carrito
                            {cartItemCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full">{cartItemCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Search & Grid */}
                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => {
                                const availableStock = getAvailableStock(product.id);
                                const isOutOfStock = availableStock === 0;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => !isOutOfStock && addToCart(product)}
                                        className={`bg-white p-3 rounded-xl shadow-sm transition-all border flex flex-col ${isOutOfStock
                                            ? 'opacity-50 cursor-not-allowed border-gray-200'
                                            : 'hover:shadow-md cursor-pointer border-transparent hover:border-blue-500 group'
                                            }`}
                                    >
                                        <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} className={`h-full w-full object-cover ${!isOutOfStock && 'transition-transform group-hover:scale-105'}`} alt={product.name} />
                                            ) : (
                                                <FaBoxOpen size={32} />
                                            )}
                                            {!isOutOfStock && (
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <FaPlus className="text-white drop-shadow-md text-2xl" />
                                                </div>
                                            )}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs">AGOTADO</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                                        <div className="mt-auto flex justify-between items-center">
                                            <span className="font-bold text-gray-900 text-lg">${parseFloat(product.sellingPrice).toFixed(2)}</span>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${isOutOfStock
                                                    ? 'bg-red-50 text-red-600'
                                                    : availableStock <= 5
                                                        ? 'bg-yellow-50 text-yellow-600'
                                                        : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {availableStock} disp.
                                                </span>
                                                {availableStock < product.stock && (
                                                    <span className="text-[9px] text-gray-400">
                                                        de {product.stock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANEL: CART (Desktop: 35%, Mobile: Full if Active) --- */}
            <div className={`w-full lg:w-[400px] bg-white shadow-2xl flex-col z-20 transition-all duration-300 ${activeTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
                {/* Mobile Header (Back to Products) */}
                <div className="lg:hidden p-4 border-b border-gray-100 flex items-center justify-between">
                    <button onClick={() => setActiveTab('products')} className="flex items-center gap-2 text-gray-600 font-bold">
                        <FaArrowLeft /> Volver a Productos
                    </button>
                    <span className="font-bold text-gray-800">Carrito ({cartItemCount})</span>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex p-6 border-b border-gray-100 items-center gap-3 bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FaShoppingCart />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Orden Actual</h2>
                        <p className="text-xs text-gray-500 font-medium">Ticket #{Math.floor(Math.random() * 10000)}</p>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                            <FaShoppingCart size={64} className="mb-4 opacity-20" />
                            <p className="font-medium opacity-50">El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.cartItemId} className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                                    <p className="text-blue-600 font-bold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 h-8">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-blue-600 transition-colors"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1">
                                        <FaTrash size={10} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Totals */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>Impuestos</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold text-xl pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || processing}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? 'Procesando...' : (
                            <>
                                <FaMoneyBillWave /> Confirmar Venta
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- VARIANT SELECTION MODAL --- */}
            {variantModal.isOpen && variantModal.product && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Selecciona una opción</h3>
                            <button
                                onClick={() => setVariantModal({ isOpen: false, product: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    {variantModal.product.imageUrl ? <img src={variantModal.product.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <FaBoxOpen />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{variantModal.product.name}</p>
                                    <p className="text-xs text-gray-500">Stock Total: {variantModal.product.stock}</p>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {variantModal.product.ProductVariants && variantModal.product.ProductVariants.length > 0 ? (
                                    variantModal.product.ProductVariants.map(variant => {
                                        const availableStock = getAvailableStock(variantModal.product.id, variant.id);
                                        const isOutOfStock = availableStock === 0;

                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                                                disabled={isOutOfStock}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isOutOfStock
                                                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-800 text-sm">{variant.size} - {variant.color}</p>
                                                    {variant.sku && (
                                                        <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                                                    )}
                                                    {availableStock < variant.stock && (
                                                        <p className="text-[10px] text-gray-400">de {variant.stock} total</p>
                                                    )}
                                                </div>
                                                <div className={`text-xs font-bold px-2 py-1 rounded-md ${isOutOfStock
                                                    ? 'bg-red-100 text-red-700'
                                                    : availableStock <= 3
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {availableStock} disp.
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500 py-4">No hay variantes disponibles</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.action}
                onCancel={modalConfig.onCancel}
                title={modalConfig.title}
                message={modalConfig.message}
                isDatgerous={modalConfig.isDatgerous}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />

        </div>
    );
};
export default POSPage;
