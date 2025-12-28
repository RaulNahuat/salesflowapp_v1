import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import raffleApi from '../../services/raffleApi';
import clientApi from '../../services/clientApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmationModal from '../../componentes/ui/ConfirmationModal';
import { FaArrowLeft, FaTrophy, FaTicketAlt, FaGift, FaCalendar, FaUser, FaPhone, FaMagic, FaUsers, FaFilePdf, FaTrash } from 'react-icons/fa';

const RaffleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [raffle, setRaffle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drawing, setDrawing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [clients, setClients] = useState([]);
    const [eligibleSales, setEligibleSales] = useState([]);
    const [mappingLoading, setMappingLoading] = useState(false);
    const [drawHistory, setDrawHistory] = useState([]);
    const [currentDraw, setCurrentDraw] = useState(null);
    const [drawPlace, setDrawPlace] = useState(1);
    const [drawAttempts, setDrawAttempts] = useState(1);
    const [batchFilters, setBatchFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        clientIds: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [activeMenu, setActiveMenu] = useState(null); // 'report' or 'print'
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', action: null, isDatgerous: false });

    useEffect(() => {
        fetchRaffle();
        fetchClients();
    }, [id]);

    useEffect(() => {
        if (id && batchFilters.startDate && batchFilters.endDate) {
            fetchEligibleSales();
        }
    }, [batchFilters, id]);

    const fetchEligibleSales = async () => {
        setMappingLoading(true);
        try {
            const data = await raffleApi.getEligibleSales(id, batchFilters);
            setEligibleSales(data);
        } catch (error) {
            console.error('Error fetching eligible sales:', error);
        } finally {
            setMappingLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const data = await clientApi.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchRaffle = async () => {
        try {
            const data = await raffleApi.getRaffle(id);
            setRaffle(data);
            setDrawAttempts(data.drawCriteria || 1);
        } catch (error) {
            toast.error('Error al cargar sorteo');
            navigate('/raffles');
        } finally {
            setLoading(false);
        }
    };

    const updateCriteria = async (val) => {
        try {
            await raffleApi.updateRaffle(id, { drawCriteria: val });
            setDrawAttempts(val);
            toast.success('Criterio de sorteo actualizado');
        } catch (e) {
            toast.error('Error al actualizar criterio');
        }
    };

    const confirmDelete = () => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar Sorteo',
            message: '¿Estás seguro de que deseas eliminar este sorteo?',
            isDatgerous: true,
            confirmText: 'Eliminar',
            action: async () => {
                try {
                    await raffleApi.deleteRaffle(id);
                    toast.success('Sorteo eliminado');
                    navigate('/raffles');
                } catch (error) {
                    toast.error('Error al eliminar sorteo');
                }
            }
        });
    };

    const confirmDraw = () => {
        if (raffle.RaffleTickets?.length === 0) return toast.error('No hay boletos');

        setModalConfig({
            isOpen: true,
            title: 'Iniciar Sorteo',
            message: `¿Estás listo para realizar el sorteo del ${drawPlace}° lugar? Esta acción seleccionará un ganador de forma aleatoria basada en tus criterios (${drawAttempts} ${drawAttempts === 1 ? 'intento' : 'intentos'}).`,
            isDatgerous: false,
            confirmText: '¡Comenzar!',
            action: handleDraw
        });
    };

    const handleDraw = async () => {
        if (raffle.RaffleTickets?.length === 0) return toast.error('No hay boletos');

        setDrawing(true);
        setDrawHistory([]);
        setCurrentDraw(null);

        try {
            const result = await raffleApi.drawWinner(id, { place: drawPlace });

            // Artificial Animation
            for (let i = 0; i < result.drawHistory.length; i++) {
                const draw = result.drawHistory[i];
                // "Spinning" effect before each reveal
                for (let j = 0; j < 5; j++) {
                    const temp = raffle.RaffleTickets[Math.floor(Math.random() * raffle.RaffleTickets.length)];
                    setCurrentDraw({ ...temp, isAnimating: true, attempt: draw.attempt });
                    await new Promise(r => setTimeout(r, 100));
                }

                setCurrentDraw({ ...draw, isAnimating: false });
                setDrawHistory(prev => [...prev, draw]);

                if (i < result.drawHistory.length - 1) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            toast.success(`🎉 ¡Ganador seleccionado: Boleto #${result.winner.number}!`);
            fetchRaffle();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al realizar sorteo');
        } finally {
            // Keep the modal/view state for a bit so user sees the winner
            setTimeout(() => setDrawing(false), 5000);
        }
    };

    const confirmGenerateBatch = () => {
        const pendingCount = eligibleSales.reduce((acc, sale) => acc + sale.pendingTickets, 0);
        if (pendingCount === 0) return toast.error('No hay boletos pendientes');

        setModalConfig({
            isOpen: true,
            title: 'Generar Boletos en Lote',
            message: `¿Estás seguro de que deseas generar ${pendingCount} boletos para las ventas filtradas? Se asignarán números aleatorios a cada cliente según su monto de compra.`,
            isDatgerous: false,
            confirmText: 'Generar Todo',
            action: handleGenerateBatch
        });
    };

    const handleGenerateBatch = async () => {
        if (!batchFilters.startDate || !batchFilters.endDate) {
            toast.error('Selecciona un rango de fechas');
            return;
        }

        setGenerating(true);
        try {
            const result = await raffleApi.generateBatchTickets(id, batchFilters);
            toast.success(result.message);
            fetchRaffle();
            fetchEligibleSales();
        } catch (error) {
            const serverError = error.response?.data?.error || '';
            toast.error(`${error.response?.data?.message || 'Error'}: ${serverError}`);
        } finally {
            setGenerating(false);
        }
    };

    // Group tickets by client
    const groupedParticipants = useMemo(() => {
        if (!raffle?.RaffleTickets) return [];
        const groups = {};
        raffle.RaffleTickets.forEach(ticket => {
            const clientId = ticket.Owner?.id || 'casual';
            if (!groups[clientId]) {
                groups[clientId] = {
                    client: ticket.Owner || { firstName: 'Cliente', lastName: 'Desconocido' },
                    tickets: []
                };
            }
            groups[clientId].tickets.push(ticket); // Push ticket object instead of just number
        });
        return Object.values(groups).sort((a, b) => b.tickets.length - a.tickets.length);
    }, [raffle?.RaffleTickets]);

    const filteredGroupedParticipants = useMemo(() => {
        if (!searchTerm) return groupedParticipants;

        const term = searchTerm.toLowerCase();
        return groupedParticipants.filter(group =>
            `${group.client.firstName} ${group.client.lastName}`.toLowerCase().includes(term) ||
            (group.client.phone && group.client.phone.includes(term)) ||
            group.tickets.some(t => t.number.toString().includes(term))
        );
    }, [groupedParticipants, searchTerm]);

    const toggleExpandGroup = (clientId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [clientId]: !prev[clientId]
        }));
    };

    const exportToPDF = (action = 'download', specificGroup = null) => {
        const doc = new jsPDF();
        const title = specificGroup ? `Participante: ${specificGroup.client.firstName} ${specificGroup.client.lastName}` : `Lista de Participantes: ${raffle.motive}`;

        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text(title, 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Sorteo: ${raffle.motive}`, 14, 30);
        doc.text(`Fecha del Sorteo: ${new Date(raffle.drawDate).toLocaleDateString('es-MX')}`, 14, 35);
        doc.text(`Total de boletos: ${specificGroup ? specificGroup.tickets.length : (raffle.RaffleTickets?.length || 0)}`, 14, 40);

        const dataSource = specificGroup ? [specificGroup] : groupedParticipants;
        const tableBody = dataSource.map(group => [
            `${group.client.firstName} ${group.client.lastName}`,
            group.client.phone || 'N/A',
            group.tickets.length,
            group.tickets.map(t => `#${t.number}`).join(', ')
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Cliente', 'Teléfono', 'Total', 'Números']],
            body: tableBody,
            headStyles: { fillStyle: 'f', fillColor: [79, 70, 229], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 20 },
                3: { cellWidth: 'auto' }
            },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        const fileNameBase = specificGroup ? `boleto_${specificGroup.client.firstName}_${raffle.motive}` : `reporte_${raffle.motive}`;
        const fileName = fileNameBase.replace(/\s+/g, '_').toLowerCase() + '.pdf';

        if (action === 'download') {
            doc.save(fileName);
            toast.success('Descarga iniciada');
        } else {
            window.open(doc.output('bloburl'), '_blank');
        }
    };

    const exportPrintableTickets = (action = 'download', specificTickets = null, clientName = '') => {
        const doc = new jsPDF();
        const tickets = specificTickets || raffle.RaffleTickets || [];

        const margin = 10;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const colWidth = (pageWidth - (margin * 2)) / 3;
        const rowHeight = 40;
        const perPage = Math.floor((pageHeight - (margin * 2)) / rowHeight) * 3;

        tickets.forEach((ticket, index) => {
            if (index > 0 && index % perPage === 0) {
                doc.addPage();
            }

            const pageIndex = index % perPage;
            const col = pageIndex % 3;
            const row = Math.floor(pageIndex / 3);

            const x = margin + (col * colWidth);
            const y = margin + (row * rowHeight);

            // Ticket Border (Dashed)
            doc.setDrawColor(200);
            doc.setLineDashPattern([2, 1], 0);
            doc.rect(x, y, colWidth, rowHeight);
            doc.setLineDashPattern([], 0);

            // Ticket content
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text(raffle.motive.substring(0, 30), x + 2, y + 5);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text(`${ticket.number}`, x + colWidth / 2, y + 20, { align: 'center' });

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(`Cliente: ${ticket.Owner?.firstName || 'Casual'} ${ticket.Owner?.lastName || ''}`, x + 2, y + 30);
            doc.text(`Fecha: ${new Date(raffle.drawDate).toLocaleDateString()}`, x + 2, y + 35);
            doc.text(`ID: ${ticket.id.substring(0, 8)}`, x + colWidth - 2, y + 35, { align: 'right' });
        });

        const fileNameBase = clientName ? `imprimir_${clientName}_${raffle.motive}` : `boletos_recortar_${raffle.motive}`;
        const fileName = fileNameBase.replace(/\s+/g, '_').toLowerCase() + '.pdf';

        if (action === 'download') {
            doc.save(fileName);
            toast.success('Descarga iniciada');
        } else {
            window.open(doc.output('bloburl'), '_blank');
        }
    };

    if (loading || !raffle) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const winner = raffle.RaffleTickets?.find(t => t.isWinner);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* ... previous header and raffle info code ... */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/raffles')}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4 font-semibold"
                >
                    <FaArrowLeft /> Volver
                </button>
                <button
                    onClick={confirmDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar Sorteo"
                >
                    <FaTrash />
                </button>
            </div>

            {/* Raffle Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{raffle.motive}</h1>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${raffle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {raffle.status === 'active' ? '🎯 Activo' : '🏆 Finalizado'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {raffle.prize && (
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl col-span-2 sm:col-span-1">
                            <FaGift className="text-blue-600 text-xl sm:text-2xl mb-1 sm:mb-2" />
                            <p className="text-[10px] sm:text-sm text-gray-600 uppercase font-bold">Premio Principal</p>
                            <p className="font-bold text-sm sm:text-base text-gray-900">{raffle.prize}</p>
                        </div>
                    )}
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-xl">
                        <FaTicketAlt className="text-purple-600 text-xl sm:text-2xl mb-1 sm:mb-2" />
                        <p className="text-[10px] sm:text-sm text-gray-600 uppercase font-bold">Boletos</p>
                        <p className="font-bold text-sm sm:text-base text-gray-900">{raffle.RaffleTickets?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-xl flex flex-col justify-center">
                        <p className="text-[10px] sm:text-sm text-gray-600 uppercase font-bold">Monto/Boleto</p>
                        <p className="font-bold text-sm sm:text-base text-gray-900">${parseFloat(raffle.ticketPrice).toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-xl">
                        <FaTrophy className="text-amber-600 text-xl sm:text-2xl mb-1 sm:mb-2" />
                        <p className="text-[10px] sm:text-sm text-gray-600 uppercase font-bold">Criterio</p>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <input
                                type="number"
                                min="1"
                                value={drawAttempts}
                                onChange={(e) => setDrawAttempts(parseInt(e.target.value))}
                                onBlur={(e) => updateCriteria(parseInt(e.target.value))}
                                className="w-8 sm:w-12 bg-transparent font-bold border-b border-amber-300 focus:outline-none text-sm sm:text-base"
                            />
                            <span className="text-[10px] sm:text-xs text-amber-700 font-bold uppercase">Saca Gana</span>
                        </div>
                    </div>
                    {raffle.drawDate && (
                        <div className="bg-orange-50 p-3 sm:p-4 rounded-xl col-span-2 lg:col-span-1 border border-orange-100">
                            <FaCalendar className="text-orange-600 text-xl sm:text-2xl mb-1 sm:mb-2" />
                            <p className="text-[10px] sm:text-sm text-gray-600 uppercase font-bold">Fecha</p>
                            <p className="font-bold text-sm sm:text-base text-gray-900">
                                {new Date(raffle.drawDate).toLocaleDateString('es-MX')}
                            </p>
                        </div>
                    )}
                </div>

                {raffle.status === 'active' && raffle.RaffleTickets?.length > 0 && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <h3 className="text-center font-bold text-gray-700 mb-4 uppercase tracking-widest">Tómbola Digital</h3>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <label className="text-xs font-bold text-gray-500 mb-1">LUGAR A SORTEAR</label>
                                <select
                                    value={drawPlace}
                                    onChange={(e) => setDrawPlace(parseInt(e.target.value))}
                                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 font-bold text-gray-700"
                                >
                                    <option value={1}>1er Lugar (Principal)</option>
                                    <option value={2}>2do Lugar</option>
                                    <option value={3}>3er Lugar</option>
                                </select>
                            </div>

                            <button
                                onClick={confirmDraw}
                                disabled={drawing}
                                className="px-12 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                <FaTrophy className={drawing ? 'animate-bounce' : ''} />
                                {drawing ? 'SORTEANDO...' : '¡INICIAR SORTEO!'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Animation Overlay */}
            {drawing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="max-w-xl w-full text-center">
                        <h2 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase italic">
                            Sorteando {drawPlace}° Lugar
                        </h2>

                        <div className="relative aspect-square max-w-[300px] mx-auto mb-12 flex items-center justify-center">
                            {/* Spinning Ball Animation */}
                            <div className={`absolute inset-0 rounded-full border-8 border-dashed border-yellow-500/50 ${currentDraw?.isAnimating ? 'animate-spin' : ''}`}></div>
                            <div className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center p-4 border-4 border-white transform transition-transform duration-500 scale-110">
                                <p className="text-white/80 text-xs font-bold uppercase mb-1">Boleto</p>
                                <p className="text-5xl font-black text-white drop-shadow-lg">
                                    {currentDraw?.ticketNumber || currentDraw?.number || '??'}
                                </p>
                                {currentDraw && !currentDraw.isAnimating && (
                                    <p className="mt-2 text-yellow-100 text-sm font-bold truncate w-full px-2">
                                        {currentDraw.client}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Draw Progress */}
                        <div className="space-y-4">
                            <p className="text-yellow-500 font-black text-xl italic uppercase">
                                Intento {currentDraw?.attempt || 0} de {drawAttempts}
                            </p>
                            <div className="flex justify-center gap-2">
                                {[...Array(drawAttempts)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-3 w-8 rounded-full transition-all duration-500 ${(i + 1) < (currentDraw?.attempt || 0) ? 'bg-green-500' :
                                            (i + 1) === (currentDraw?.attempt || 0) ? 'bg-yellow-500 w-12 animate-pulse' :
                                                'bg-white/20'
                                            }`}
                                    ></div>
                                ))}
                            </div>

                            {currentDraw && !currentDraw.isAnimating && (
                                <p className={`text-2xl font-bold ${currentDraw.isRealWinner ? 'text-green-400 scale-125' : 'text-red-400'}`}>
                                    {currentDraw.isRealWinner ? '¡GANADOR!' : 'FUERA'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Generation Section */}
            {raffle.status === 'active' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <FaMagic className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Generación Manual de Boletos</h2>
                            <p className="text-sm text-gray-500">Genera boletos basados en ventas pasadas por rango de fecha o cliente.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
                            <input
                                type="date"
                                value={batchFilters.startDate}
                                onChange={(e) => setBatchFilters({ ...batchFilters, startDate: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
                            <input
                                type="date"
                                value={batchFilters.endDate}
                                onChange={(e) => setBatchFilters({ ...batchFilters, endDate: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente (Opcional)</label>
                            <select
                                value={batchFilters.clientIds[0] || ''}
                                onChange={(e) => setBatchFilters({ ...batchFilters, clientIds: e.target.value ? [e.target.value] : [] })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="">Todos los clientes</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={confirmGenerateBatch}
                        disabled={generating || mappingLoading || eligibleSales.filter(s => s.pendingTickets > 0).length === 0}
                        className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {generating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generando...
                            </>
                        ) : (
                            <>
                                <FaMagic /> Generar {eligibleSales.reduce((acc, sale) => acc + sale.pendingTickets, 0)} Boletos Pendientes
                            </>
                        )}
                    </button>

                    {/* Mapping Table / Preview */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                <FaUsers className="text-indigo-500" /> Mapeo de Ventas
                            </h3>
                            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Total Pendiente</p>
                                    <p className="text-xl font-black text-indigo-900">
                                        {eligibleSales.reduce((acc, sale) => acc + sale.pendingTickets, 0)} <span className="text-sm font-bold">Boletos</span>
                                    </p>
                                </div>
                                <div className="h-8 w-[1px] bg-indigo-200"></div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Ventas</p>
                                    <p className="text-xl font-black text-indigo-900">{eligibleSales.length}</p>
                                </div>
                            </div>
                        </div>

                        {mappingLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : eligibleSales.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">No hay ventas pendientes por procesar.</p>
                            </div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 rounded-2xl">
                                {/* Desktop View */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold">Fecha</th>
                                                <th className="px-4 py-3 text-left font-bold">Cliente</th>
                                                <th className="px-4 py-3 text-right font-bold">Venta</th>
                                                <th className="px-4 py-3 text-center font-bold">A Generar</th>
                                                <th className="px-4 py-3 text-center font-bold">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {eligibleSales.map((sale) => (
                                                <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {new Date(sale.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{sale.client}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700 font-mono">${parseFloat(sale.total).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center font-black text-indigo-600">
                                                        {sale.pendingTickets > 0 ? `+${sale.pendingTickets}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-center">
                                                            {sale.pendingTickets === 0 ? (
                                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                                    Completado
                                                                </span>
                                                            ) : (
                                                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                                    Pendiente
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View (Cards) */}
                                <div className="sm:hidden space-y-4">
                                    {eligibleSales.map((sale) => (
                                        <div key={sale.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-black text-gray-900">{sale.client}</p>
                                                    <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-mono font-bold text-gray-700">${parseFloat(sale.total).toFixed(2)}</p>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Boletos Pendientes</p>
                                                <p className={`font-black ${sale.pendingTickets > 0 ? 'text-indigo-600' : 'text-green-600'}`}>
                                                    {sale.pendingTickets > 0 ? `+${sale.pendingTickets}` : '✓'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Winners */}
            {raffle.RaffleTickets?.filter(t => t.isWinner).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {raffle.RaffleTickets.filter(t => t.isWinner)
                        .sort((a, b) => (a.place || 1) - (b.place || 1))
                        .map(win => (
                            <div key={win.id} className={`rounded-2xl shadow-lg p-6 border-2 transform hover:scale-105 transition-all
                                ${win.place === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-200' :
                                    win.place === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 border-gray-100' :
                                        'bg-gradient-to-br from-amber-600 to-amber-800 text-white border-amber-500'}`}>
                                <h2 className="text-xl font-bold mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FaTrophy /> {win.place === 1 ? '1er Lugar' : win.place === 2 ? '2do Lugar' : '3er Lugar'}
                                    </div>
                                    <span className="bg-white/30 px-3 py-1 rounded-full text-xs">#{win.number}</span>
                                </h2>
                                <div className="space-y-1">
                                    <p className="text-lg font-black truncate">
                                        {win.Owner?.firstName} {win.Owner?.lastName}
                                    </p>
                                    <p className="text-sm opacity-90 flex items-center gap-1">
                                        <FaPhone className="text-xs" /> {win.Owner?.phone || 'Sin tel'}
                                    </p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}

            {/* Tickets/Participants List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1 w-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 lg:mb-0">Boletos y Participantes</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar boleto, cliente o tel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'report' ? null : 'report')}
                                    disabled={!raffle.RaffleTickets?.length}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                    <FaFilePdf /> Reporte
                                </button>
                                {activeMenu === 'report' && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button onClick={() => { exportToPDF('preview'); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-xl border-b border-gray-50 font-medium">Visualizar</button>
                                            <button onClick={() => { exportToPDF('download'); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-xl font-medium">Descargar</button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === 'print' ? null : 'print')}
                                    disabled={!raffle.RaffleTickets?.length}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                    <FaTicketAlt /> Imprimir
                                </button>
                                {activeMenu === 'print' && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button onClick={() => { exportPrintableTickets('preview'); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-xl border-b border-gray-50 font-medium font-medium">Visualizar (Recortables)</button>
                                            <button onClick={() => { exportPrintableTickets('download'); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-xl font-medium">Descargar (Recortables)</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {raffle.RaffleTickets?.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay boletos aún</p>
                    ) : (
                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredGroupedParticipants.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-400 font-medium">No se encontraron participantes que coincidan</div>
                                ) : (
                                    filteredGroupedParticipants.map((group, i) => {
                                        const clientId = group.client.id || `group-${i}`;
                                        const isExpanded = expandedGroups[clientId];
                                        const ticketsToShow = isExpanded ? group.tickets : group.tickets.slice(0, 10);
                                        const hasMore = group.tickets.length > 10;

                                        return (
                                            <div key={clientId} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-colors self-start shadow-sm flex flex-col">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                        {group.client.firstName.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 leading-tight truncate">{group.client.firstName} {group.client.lastName}</p>
                                                        <p className="text-xs text-gray-500">{group.client.phone || 'Sin teléfono'}</p>
                                                    </div>
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenu(activeMenu === `client-${clientId}` ? null : `client-${clientId}`);
                                                            }}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FaFilePdf size={18} />
                                                        </button>
                                                        {activeMenu === `client-${clientId}` && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
                                                                    <button onClick={() => { exportToPDF('download', group); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-t-xl border-b border-gray-50 font-medium font-medium">📜 Reporte Individual</button>
                                                                    <button onClick={() => { exportPrintableTickets('download', group.tickets, `${group.client.firstName}_${group.client.lastName}`); setActiveMenu(null); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 rounded-b-xl font-medium">🎟️ Boletos (Recortables)</button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        {group.tickets.length}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                    {ticketsToShow.map(t => (
                                                        <span key={t.id} className={`border px-2 py-1 rounded-lg text-xs font-bold transition-all
                                                                        ${t.isWinner ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-200 text-gray-600'}`}>
                                                            #{t.number}
                                                        </span>
                                                    ))}
                                                    {!isExpanded && hasMore && (
                                                        <span className="bg-gray-200 border border-gray-300 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">
                                                            +{group.tickets.length - 10}
                                                        </span>
                                                    )}
                                                </div>
                                                {hasMore && (
                                                    <button
                                                        onClick={() => toggleExpandGroup(clientId)}
                                                        className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors mt-auto pt-2"
                                                    >
                                                        {isExpanded ? 'Ver menos' : 'Ver todos'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
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

export default RaffleDetail;
