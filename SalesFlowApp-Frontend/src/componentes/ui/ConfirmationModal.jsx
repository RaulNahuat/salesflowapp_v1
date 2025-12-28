import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, onCancel, title, message, confirmText = "Confirmar", cancelText = "Cancelar", isDatgerous = false }) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all animate-scaleIn">
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${isDatgerous ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDatgerous ? 'text-red-700' : 'text-gray-800'}`}>
                        {isDatgerous && <FaExclamationTriangle />}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-gray-600 leading-relaxed">
                        {message}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors order-2 sm:order-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`w-full sm:w-auto px-4 py-2.5 text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 order-1 sm:order-2 ${isDatgerous
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
