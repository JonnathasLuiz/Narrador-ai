
import React from 'react';
import { QuestionMarkCircleIcon } from '../components/icons/QuestionMarkCircleIcon';
import { KeyIcon } from '../components/icons/KeyIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';

interface HeaderProps {
    onOpenHelp: () => void;
    onApiKeyEdit: () => void;
    onInstall: () => void;
    showInstallButton: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onOpenHelp,
    onApiKeyEdit,
    onInstall,
    showInstallButton,
}) => {
    return (
        <header className="text-center relative">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Narrador de Podcast IA</h1>
            <p className="mt-2 text-gray-400">Transforme ideias e roteiros em podcasts com múltiplas vozes. Seu trabalho é salvo automaticamente.</p>
            <div className="absolute top-0 right-0 flex items-center gap-2">
                 {showInstallButton && (
                    <button
                        onClick={onInstall}
                        className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
                        aria-label="Instalar aplicativo"
                        title="Instalar Aplicativo"
                    >
                        <DownloadIcon className="h-6 w-6" />
                    </button>
                )}
                 <button
                    onClick={onApiKeyEdit}
                    className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
                    aria-label="Editar chave de API"
                    title="Editar Chave de API"
                >
                    <KeyIcon className="h-6 w-6" />
                </button>
                <button
                    onClick={onOpenHelp}
                    className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
                    aria-label="Abrir guia de ajuda"
                    title="Ajuda"
                >
                    <QuestionMarkCircleIcon className="h-7 w-7" />
                </button>
            </div>
        </header>
    );
};
