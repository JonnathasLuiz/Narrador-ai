import React, { useState } from 'react';
import { KeyIcon } from '../icons/KeyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ExternalLinkIcon } from '../icons/ExternalLinkIcon';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSave: (apiKey: string) => void;
    error?: string | null;
    clearError: () => void;
    onInstall: () => void;
    showInstallButton: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, error, clearError, onInstall, showInstallButton }) => {
    const [localApiKey, setLocalApiKey] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        clearError();
        onSave(localApiKey);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (error) {
            clearError();
        }
        setLocalApiKey(e.target.value);
    }

    const handleOpenInNewTab = () => {
        window.open(window.location.origin, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-11/12 max-w-lg text-gray-200 relative border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <KeyIcon className="h-8 w-8 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-indigo-400">Configure sua Chave de API do Gemini</h2>
                </div>

                <p className="mb-4 text-gray-300">
                    Para usar os recursos de IA desta ferramenta, você precisa de uma chave de API do Google Gemini.
                </p>
                <p className="mb-6 text-sm text-gray-400">
                    Sua chave é salva <strong className="text-gray-200">apenas no seu navegador</strong> e nunca é enviada para nossos servidores.
                </p>

                <div className="space-y-4">
                    <input
                        type="password"
                        value={localApiKey}
                        onChange={handleInputChange}
                        placeholder="Cole sua chave de API aqui"
                        className={`w-full bg-gray-900 border rounded-lg p-3 focus:outline-none transition ${error ? 'border-red-500 ring-2 ring-red-900/50' : 'border-gray-600 focus:ring-2 focus:ring-indigo-500'}`}
                        aria-invalid={!!error}
                        aria-describedby="api-key-error"
                    />
                     {error && (
                        <p id="api-key-error" className="text-sm text-red-400">{error}</p>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <a
                        href="https://ai.google.dev/gemini-api/docs/api-key"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline order-last sm:order-first"
                    >
                        Como obter uma chave de API?
                    </a>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                         <button
                            onClick={handleOpenInNewTab}
                            className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                            aria-label="Abrir em nova aba"
                            title="Abrir em Nova Aba"
                        >
                            <ExternalLinkIcon className="h-5 w-5" />
                            Nova Aba
                        </button>
                        {showInstallButton && (
                            <button
                                onClick={onInstall}
                                className="flex-1 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                aria-label="Instalar aplicativo"
                                title="Instalar Aplicativo"
                            >
                                <DownloadIcon className="h-5 w-5" />
                                Instalar App
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!localApiKey.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Salvar e Continuar
                        </button>
                    </div>
                </div>
                 {!showInstallButton && (
                    <p className="text-xs text-gray-400 text-center mt-4 pt-4 border-t border-gray-700/50">
                        Dica: Para instalar o aplicativo, use o botão "Nova Aba" para abri-lo fora do AI Studio.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ApiKeyModal;