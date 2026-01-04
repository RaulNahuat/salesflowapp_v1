import React, { useState, useEffect, useMemo } from 'react';
import {
    FaSearch,
    FaShoppingCart,
    FaTrash,
    FaUser,
    FaMoneyBillWave,
    FaBoxOpen,
    FaArrowLeft,
    FaPlus,
    FaMinus,
    FaArrowRight,
    FaWhatsapp,
    FaFileInvoiceDollar,
    FaTicketAlt,
    FaStore,
    FaRegSmile,
    FaTimes,
    FaChevronRight,
    FaCheckCircle,
    FaUsers,
    FaPhone
} from 'react-icons/fa';
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

    // --- POLLING STOCK UPDATES (Every 10s) ---
    useEffect(() => {
        const interval = setInterval(async () => {
            // Don't refresh if user is in the middle of a transaction or modal is open
            if (processing || modalConfig.isOpen) return;

            try {
                const productsData = await productApi.getProducts();
                // Update products to reflect real-time stock
                setProducts(productsData.filter(p => p.stock > 0));
            } catch (error) {
                console.error("Background stock update failed", error);
            }
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [processing, modalConfig.isOpen]);

    // --- COMPUTED ---
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const getAvailableStock = (targetProductOrId, variantId = null) => {
        const product = typeof targetProductOrId === 'string'
            ? products.find(p => p.id === targetProductOrId)
            : targetProductOrId;

        if (!product) return 0;

        const productId = product.id;
        let inCart = 0;

        if (variantId) {
            const cartItemId = `${productId}-${variantId}`;
            const cartItem = cart.find(item => item.cartItemId === cartItemId);
            inCart = cartItem ? cartItem.quantity : 0;
        } else {
            inCart = cart
                .filter(item => item.productId === productId)
                .reduce((sum, item) => sum + item.quantity, 0);
        }

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
        return cart.reduce((sum, item) => sum + item.quantity, 0);
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

    const [variantModal, setVariantModal] = useState({ isOpen: false, product: null });

    const addToCart = (product) => {
        if (product.ProductVariants && product.ProductVariants.length > 0) {
            setVariantModal({ isOpen: true, product });
            return;
        }
        addItemToCart(product, null);
    };

    const handleVariantSelect = (variant) => {
        if (!variantModal.product) return;
        addItemToCart(variantModal.product, variant);
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
            setCart(prev => prev.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart(prev => [...prev, {
                productId: product.id,
                variantId: variant ? variant.id : null,
                cartItemId: cartItemId,
                name: itemName,
                price: parseFloat(product.sellingPrice),
                quantity: 1,
                maxStock: maxStock
            }]);
        }
        toast.success(`+1 ${itemName.slice(0, 15)}...`, { duration: 800, position: 'bottom-center' });
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

    const handleManualQuantityChange = (cartItemId, valStr) => {
        const item = cart.find(i => i.cartItemId === cartItemId);
        if (!item) return;

        // Allow empty string to let user delete content
        if (valStr === '') {
            setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: '' } : i));
            return;
        }

        const newQty = parseInt(valStr, 10);

        // Prevent negative or zero if not empty
        if (isNaN(newQty) || newQty < 1) return;

        if (newQty > item.maxStock) {
            toast.error(`Solo hay ${item.maxStock} disponibles`);
            setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: item.maxStock } : i));
            return;
        }

        setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i));
    };

    const handleInputBlur = (cartItemId) => {
        const item = cart.find(i => i.cartItemId === cartItemId);
        if (!item) return;

        // Reset to 1 if empty or invalid on blur
        if (item.quantity === '' || item.quantity < 1) {
            setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: 1 } : i));
        }
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

            // Build receipt URL
            let receiptUrl = '';
            if (receiptToken) {
                receiptUrl = businessSlug
                    ? `${window.location.origin}/${businessSlug}/r/${receiptToken}`
                    : `${window.location.origin}/r/${receiptToken}`;
            }

            let ticketMsg = "";
            if (tickets.length > 0) {
                ticketMsg = "\n\n🎟️ *¡Felicidades! Ganaste boletos:*";
                tickets.forEach(rt => {
                    ticketMsg += `\n- ${rt.raffleMotive}: *${rt.tickets.join(", ")}*`;
                });
            }

            let whatsappMsg = `*¡Hola ${selectedClient.firstName}!* 👋\n\nTu compra en *${businessName}* ha sido registrada:\nTotal: *${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cartTotal)}*${ticketMsg}`;
            if (receiptUrl) whatsappMsg += `\n\n📄 *Ver tu ticket digital:*\n${receiptUrl}`;
            whatsappMsg += `\n\n¡Gracias por tu preferencia! ✨`;

            setCart([]);
            setActiveTab('products');
            setSearchTerm('');

            const updatedProds = await productApi.getProducts();
            setProducts(updatedProds.filter(p => p.stock > 0));

            setModalConfig({
                isOpen: true,
                title: '¡Venta completada!',
                message: (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                <FaCheckCircle size={40} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 font-medium text-sm">Venta procesada con éxito</p>
                            <p className="text-3xl font-bold text-slate-800 tracking-tight mt-1">${parseFloat(cartTotal).toLocaleString('es-MX', { minimumFractionDigits: 1 })}</p>
                        </div>

                        {tickets.length > 0 && (
                            <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100">
                                <p className="font-bold text-amber-800 flex items-center gap-2 mb-2 text-xs uppercase tracking-widest">
                                    <FaTicketAlt /> Boletos Generados
                                </p>
                                <div className="space-y-1">
                                    {tickets.map((rt, i) => (
                                        <p key={i} className="text-sm text-amber-900/80 font-medium">
                                            {rt.raffleMotive}: <span className="font-bold">{rt.tickets.join(", ")}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {receiptToken && (
                                <button
                                    onClick={() => window.open(receiptUrl, '_blank')}
                                    className="flex-1 bg-blue-50 text-blue-600 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    <FaFileInvoiceDollar size={14} /> Ver Ticket
                                </button>
                            )}
                            {selectedClient.phone && (
                                <button
                                    onClick={() => {
                                        const url = `https://wa.me/${selectedClient.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="flex-1 bg-emerald-50 text-emerald-600 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    <FaWhatsapp size={16} /> WhatsApp
                                </button>
                            )}
                        </div>
                    </div>
                ),
                isDatgerous: false,
                confirmText: 'Nueva Venta',
                cancelText: 'Salir',
                action: () => { /* Close modal */ },
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Iniciando Punto de Venta...</p>
            </div>
        );
    }

    // --- STEP 1: CLIENT SELECTION ---
    if (step === 1) {
        const filteredClients = clients.filter(c =>
            c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm))
        );

        return (
            <div className="flex flex-col h-[calc(100vh-140px)] -m-4 sm:-m-10 bg-white overflow-hidden animate-fade-up">
                {/* 1. Full Page Vibrant Header */}
                <div className="relative overflow-hidden bg-vibrant p-8 sm:p-10 shadow-vibrant">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                    <FaRegSmile size={14} />
                                </div>
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Nueva Operación</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Nueva Venta</h1>
                            <p className="text-blue-50/70 text-xs font-medium max-w-lg leading-relaxed mt-1">
                                Selecciona un cliente registrado o continúa con una venta rápida.
                            </p>
                        </div>
                        <button
                            onClick={handleCasualClient}
                            className="bg-white text-blue-600 flex items-center justify-center gap-2 h-12 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all shadow-lg shadow-black/5 shrink-0"
                        >
                            <FaRegSmile size={14} />
                            <span>Cliente Casual</span>
                        </button>
                    </div>
                </div>

                {/* 2. Client Search & List Section */}
                <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
                    <div className="max-w-3xl mx-auto w-full flex flex-col h-full p-6 sm:p-10 overflow-hidden">
                        {/* Search Bar - High Visibility */}
                        <div className="relative mb-8 group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 pointer-events-none transition-colors">
                                <FaSearch size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Escribe nombre o teléfono del cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-14 text-base"
                                autoFocus
                            />
                        </div>

                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {searchTerm ? `Resultados para "${searchTerm}"` : 'Clientes Registrados'}
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400">{filteredClients.length} encontrados</span>
                        </div>

                        {/* List - High Density */}
                        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                            <div className="grid grid-cols-1 gap-2">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map(client => (
                                        <div
                                            key={client.id}
                                            onClick={() => handleClientSelect(client)}
                                            className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-soft cursor-pointer flex items-center justify-between group transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 text-blue-600 flex items-center justify-center font-bold text-base border border-slate-100 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                                                    {client.firstName.charAt(0)}{client.lastName?.charAt(0) || ''}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 tracking-tight text-sm group-hover:text-blue-700 transition-colors leading-none mb-1.5">{client.firstName} {client.lastName}</p>
                                                    {client.phone && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                            <FaPhone size={8} className="text-slate-300 group-hover:text-blue-400" /> {client.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                                                <FaChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem] opacity-40">
                                        <FaSearch size={40} className="mb-4 text-slate-300" />
                                        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Sin resultados encontrados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 2: PREMIUM POS LAYOUT ---
    return (
        <div className="flex h-[calc(100vh-140px)] -m-4 sm:-m-10 bg-[#f8fafc] overflow-hidden font-sans rounded-none lg:rounded-[3rem] shadow-none lg:shadow-float border border-slate-100 relative">
            {/* Products Side */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${activeTab === 'cart' ? 'hidden' : 'flex'}`}>
                {/* Vibrant Header POS */}
                <div className="relative overflow-hidden bg-vibrant p-4 sm:p-6 lg:px-8 lg:py-6 shadow-lg shadow-blue-600/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 backdrop-blur-md text-white rounded-[10px] flex items-center justify-center font-bold text-xs border border-white/20 uppercase">
                                    {selectedClient?.firstName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-sm font-bold text-white tracking-tight truncate leading-none">
                                        {selectedClient?.firstName} {selectedClient?.lastName}
                                    </h1>
                                    <p className="text-[8px] font-bold text-blue-100 uppercase tracking-widest leading-none mt-1">Registrando venta</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedClient(null); setStep(1); setCart([]); }}
                                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>

                        {/* Search Bar - Integrated in Header style */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-focus-within:text-white transition-colors">
                                <FaSearch size={12} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o SKU..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl focus:bg-white focus:text-slate-800 placeholder:text-white/40 focus:placeholder:text-slate-300 outline-none transition-all font-bold text-white text-xs"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* List Products */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="divide-y divide-slate-50 border-b border-slate-50">
                        {filteredProducts.map(product => {
                            const availableStock = getAvailableStock(product);
                            const isOutOfStock = availableStock === 0;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => !isOutOfStock && addToCart(product)}
                                    className={`
                                        group flex items-center justify-between p-3 px-6 hover:bg-slate-50 transition-colors
                                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-slate-300 flex-shrink-0">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <FaBoxOpen size={16} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{product.category || 'General'}</p>
                                            <h3 className="font-bold text-slate-800 tracking-tight text-xs leading-tight group-hover:text-blue-600 transition-colors truncate">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="font-bold text-blue-600 text-[11px]">
                                                    ${parseFloat(product.sellingPrice).toLocaleString('es-MX', { minimumFractionDigits: 1 })}
                                                </p>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest ${availableStock <= 3 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    Stock: {availableStock}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center scale-0 group-hover:scale-100 transition-all opacity-0 group-hover:opacity-100">
                                        <FaPlus size={10} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Cart Side - Sticky on Desktop */}
            <div className={`w-full lg:w-[450px] bg-white border-l border-slate-100 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)] transition-all duration-300 ${activeTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex flex-col h-full bg-gradient-to-b from-white via-[#fcfdfe] to-[#f8faff]">
                    <div className="relative overflow-hidden bg-vibrant p-6 sm:p-8 text-white mb-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Mi Carrito</h2>
                                <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest mt-0.5">
                                    {cartItemCount} Artículos en orden
                                </p>
                            </div>
                            <div className="lg:hidden p-2.5 bg-white/10 text-white rounded-xl active:scale-90 transition-transform" onClick={() => setActiveTab('products')}>
                                <FaTimes size={16} />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 sm:px-8 flex-1 flex flex-col min-h-0">

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-8">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <FaShoppingCart size={60} className="mb-4" />
                                    <p className="font-bold uppercase tracking-[0.2em] text-[11px]">Carrito Vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.cartItemId} className="flex gap-4 group animate-fade-up">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 flex-shrink-0 font-bold">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 tracking-tight text-sm truncate leading-none mb-1">{item.name}</h4>
                                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest leading-none mb-2">
                                                ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} / unidad
                                            </p>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-slate-50 rounded-xl px-1 py-1 border border-slate-100">
                                                    <button onClick={() => handleUpdateQuantity(item.cartItemId, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 active:scale-75 transition-all">
                                                        <FaMinus size={10} />
                                                    </button>
                                                    <span className="w-12 text-center text-sm text-slate-800">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.maxStock}
                                                            value={item.quantity}
                                                            onChange={(e) => handleManualQuantityChange(item.cartItemId, e.target.value)}
                                                            onBlur={() => handleInputBlur(item.cartItemId)}
                                                            className="w-full text-center font-bold bg-transparent outline-none p-0 appearance-none m-0"
                                                            style={{ MozAppearance: 'textfield' }}
                                                        />
                                                    </span>
                                                    <button onClick={() => handleUpdateQuantity(item.cartItemId, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 active:scale-75 transition-all">
                                                        <FaPlus size={10} />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center">
                                            <p className="text-lg font-bold text-slate-800 tracking-tighter">
                                                ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Total & Checkout */}
                        <div className="space-y-6 pt-8 border-t border-slate-100">
                            {/* Checkout Section */}
                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total a Pagar</p>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <FaCheckCircle size={8} /> Efectivo
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800 tracking-tight leading-none">
                                        ${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || processing}
                                    className="w-full bg-vibrant text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaMoneyBillWave size={16} className="text-white/80" />
                                            <span>Completar Venta</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Float Overlay (Fixed position to avoid overlap) */}
            <div className={`lg:hidden fixed bottom-6 right-6 z-50 transition-all duration-300 ${activeTab === 'cart' ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
                <button
                    onClick={() => setActiveTab(activeTab === 'products' ? 'cart' : 'products')}
                    className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 text-white flex items-center justify-center relative transition-all active:scale-95 hover:bg-blue-700"
                >
                    <FaShoppingCart size={20} />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm animate-bounce">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Variant Modal Premium */}
            {variantModal.isOpen && variantModal.product && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Elegir Variante</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{variantModal.product.name}</p>
                            </div>
                            <button onClick={() => setVariantModal({ isOpen: false, product: null })} className="p-2 text-slate-300 hover:text-slate-800 active:scale-90 transition-all">
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto no-scrollbar space-y-3">
                            {variantModal.product.ProductVariants.map(variant => {
                                const availableStock = getAvailableStock(variantModal.product, variant.id);
                                const isOutOfStock = availableStock === 0;
                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                                        disabled={isOutOfStock}
                                        className={`
                                             w-full p-5 rounded-3xl border flex items-center justify-between transition-all group
                                             ${isOutOfStock ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98]'}
                                         `}
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800 tracking-tight leading-none mb-1 group-hover:text-blue-700 transition-colors uppercase text-xs">{variant.size} • {variant.color}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{variant.sku || 'S/SKU'}</p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest ${isOutOfStock ? 'bg-rose-50 text-rose-500' : availableStock <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {isOutOfStock ? 'Agotado' : `${availableStock} Dispo`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

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
