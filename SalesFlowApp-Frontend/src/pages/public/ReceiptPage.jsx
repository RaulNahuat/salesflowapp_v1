import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilePdf, FaWhatsapp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import saleApi from '../../services/saleApi';

const ReceiptPage = () => {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await saleApi.getReceiptData(token);
                setData(result);
            } catch (err) {
                setError(err.message || 'Error al cargar el recibo');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    // Helper to format variant string
    const formatVariant = (variant) => {
        if (!variant) return '';
        // Assuming variant has attributes like size, color, material, etc.
        // Adapt based on your actual ProductVariant model fields
        const parts = [];
        if (variant.size) parts.push(`Talla: ${variant.size}`);
        if (variant.color) parts.push(`Color: ${variant.color}`);
        if (variant.material) parts.push(`Mat: ${variant.material}`);
        // Fallback or generic attributes
        if (parts.length === 0 && variant.attribute1) parts.push(variant.attribute1);
        if (parts.length === 0 && variant.attribute2) parts.push(variant.attribute2);

        return parts.length > 0 ? `(${parts.join(', ')})` : '';
    };

    // Aggregate products helper
    const getAggregatedProducts = () => {
        if (!data) return [];
        const productMap = {};

        data.sales.forEach(sale => {
            sale.SaleDetails.forEach(detail => {
                const prodName = detail.Product ? detail.Product.name : 'Producto';
                const variantInfo = detail.ProductVariant ? formatVariant(detail.ProductVariant) : '';

                // key includes variant so different variants are separate lines
                const key = `${prodName}-${detail.ProductVariant?.id || 'base'}`;

                if (!productMap[key]) {
                    productMap[key] = {
                        name: prodName,
                        variantInfo: variantInfo,
                        quantity: 0,
                        totalPrice: 0
                    };
                }
                productMap[key].quantity += detail.quantity;
                productMap[key].totalPrice += parseFloat(detail.subtotal);
            });
        });

        return Object.values(productMap).sort((a, b) => b.totalPrice - a.totalPrice);
    };

    const generatePDF = () => {
        if (!data) return;

        const doc = new jsPDF();

        // --- PAGE BORDER ---
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(10, 10, 190, 277, 3, 3, 'S');

        let yPos = 30;

        // Branding Logic
        const businessName = data.business?.name || "SalesFlow";

        // --- HEADER ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(33, 37, 41); // Dark gray
        doc.text(businessName.toUpperCase(), 105, yPos, { align: "center" });
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(108, 117, 125); // Gray text
        doc.setCharSpace(2); // Spacing for "TICKET DE COMPRA"
        doc.text("TICKET DE COMPRA", 105, yPos, { align: "center" });
        doc.setCharSpace(0); // Reset
        yPos += 20;

        // --- META INFO ---
        // Background strip for meta info
        doc.setFillColor(248, 249, 250); // Very light gray
        doc.rect(12, yPos - 5, 186, 25, 'F');

        doc.setFontSize(10);
        doc.setTextColor(80);

        // Left Column: Client
        doc.text("CLIENTE:", 20, yPos + 5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(data.clientName, 50, yPos + 5);

        // Right Column: Date
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text("FECHA:", 130, yPos + 5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(new Date().toLocaleDateString(), 150, yPos + 5);

        yPos += 30;

        // --- PRODUCT TABLE HEADERS ---
        // Header background
        doc.setFillColor(52, 58, 64); // Dark background
        doc.rect(12, yPos - 6, 186, 10, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        doc.text("PRODUCTO", 20, yPos);
        doc.text("CANT.", 150, yPos, { align: "center" });
        doc.text("TOTAL", 190, yPos, { align: "right" });
        yPos += 12;

        // --- ITEMS ---
        doc.setFont("helvetica", "normal");
        doc.setTextColor(33, 37, 41);
        doc.setFontSize(10);

        const aggregated = getAggregatedProducts();
        aggregated.forEach((item, index) => {
            const unitPrice = item.totalPrice / item.quantity;

            // Check for page break
            if (yPos > 260) {
                doc.addPage();
                doc.setDrawColor(200, 200, 200);
                doc.roundedRect(10, 10, 190, 277, 3, 3, 'S');
                yPos = 30;
            }

            // Zebra striping for rows (optional, keeping it clean white for now)
            // if (index % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(12, yPos - 4, 186, 8 + (item.variantInfo ? 4 : 0), 'F'); }

            // Item Name
            let nameText = item.name;
            if (item.variantInfo) {
                nameText += ` ${item.variantInfo}`;
            }

            // Handle long names
            let splitName = doc.splitTextToSize(nameText, 110);
            doc.text(splitName, 20, yPos);

            // Quantity
            doc.text(`${item.quantity}`, 150, yPos, { align: "center" });

            // Total
            doc.text(`$${item.totalPrice.toFixed(2)}`, 190, yPos, { align: "right" });

            // Unit Price (small below name)
            let rows = splitName.length;
            let finalY = yPos + (rows * 5);

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`$${unitPrice.toFixed(2)} c/u`, 20, finalY);

            // Separator Line (Light dashed)
            doc.setDrawColor(230);
            doc.setLineWidth(0.1);
            doc.line(20, finalY + 4, 190, finalY + 4);

            // Reset for next row
            doc.setFontSize(10);
            doc.setTextColor(33, 37, 41);
            yPos = finalY + 12;
        });

        // --- TOTAL ---
        yPos += 5;

        // Total Box
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(120, yPos, 78, 20, 2, 2, 'F');

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(80);
        doc.text("TOTAL A PAGAR", 145, yPos + 13, { align: "right" });

        doc.setFontSize(16);
        doc.setTextColor(33, 37, 41);
        doc.text(`$${data.total.toFixed(2)}`, 190, yPos + 13, { align: "right" });

        // --- FOOTER ---
        const footerY = 275;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont("helvetica", "italic");
        doc.text("Gracias por su preferencia", 105, footerY, { align: "center" });
        doc.text("Generado por SalesFlow", 105, footerY + 5, { align: "center" });

        doc.save(`Ticket_${data.clientName.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold">Cargando recibo...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;

    const aggregatedList = getAggregatedProducts();
    const businessName = data.business?.name || "SalesFlow";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
            {/* Receipt Container */}
            <div className="bg-white relative w-full max-w-md shadow-2xl rounded-sm overflow-hidden transform transition-all hover:scale-[1.005] duration-300">
                {/* Decorative top border */}
                <div className="h-2 bg-blue-600 w-full"></div>

                <div className="p-8 pb-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 overflow-hidden">
                            {data.business?.logoURL ? (
                                <img src={data.business.logoURL} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-blue-600 tracking-tighter">
                                    {businessName.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-1">{businessName}</h1>
                        <p className="text-sm text-gray-400 font-medium tracking-wide">TICKET DE COMPRA</p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex justify-between items-center text-xs text-gray-400 font-medium mb-8 uppercase tracking-wider border-b border-gray-100 pb-4">
                        <div className="text-left">
                            <p className="mb-1">Cliente</p>
                            <p className="text-gray-900 font-bold">{data.clientName}</p>
                        </div>
                        <div className="text-right">
                            <p className="mb-1">Fecha</p>
                            <p className="text-gray-900 font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="mb-8">
                        <div className="space-y-4">
                            {aggregatedList.map((item, idx) => {
                                const unitPrice = item.totalPrice / item.quantity;
                                return (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-start text-sm">
                                            <div className="flex gap-3">
                                                <span className="font-bold text-gray-400 w-5 tabular-nums text-right">
                                                    {item.quantity}x
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800 font-semibold leading-tight group-hover:text-blue-600 transition-colors">
                                                        {item.name} <span className="text-gray-500 font-normal text-xs">{item.variantInfo}</span>
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 mt-0.5">
                                                        ${unitPrice.toFixed(2)} c/u
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-900 tabular-nums">
                                                ${item.totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t-2 border-dashed border-gray-200 my-8"></div>

                    {/* Total Section */}
                    <div className="flex justify-between items-end mb-10">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total a Pagar</span>
                        <div className="text-right">
                            <span className="text-4xl font-black text-gray-900 tracking-tighter shadow-blue-200 drop-shadow-sm">
                                ${data.total.toFixed(2)}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">Moneda Nacional</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={generatePDF}
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
                    >
                        <FaFilePdf className="text-lg group-hover:scale-110 transition-transform" />
                        <span>Descargar PDF</span>
                    </button>

                    <p className="text-center text-[10px] text-gray-300 mt-6 font-medium uppercase tracking-widest">
                        Generado por SalesFlow
                    </p>
                </div>

                {/* Decorative jagged bottom (Visual CSS trick) */}
                <div
                    className="absolute bottom-0 left-0 w-full h-4 bg-gray-50"
                    style={{
                        backgroundImage: 'linear-gradient(135deg, white 25%, transparent 25%), linear-gradient(225deg, white 25%, transparent 25%)',
                        backgroundPosition: '0 0',
                        backgroundSize: '20px 20px'
                    }}
                ></div>
            </div>
        </div >
    );
};

export default ReceiptPage;
