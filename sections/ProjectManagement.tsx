
import React from 'react';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { LoadIcon } from '../components/icons/LoadIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { SaveIcon } from '../components/icons/SaveIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';

interface ProjectManagementProps {
    onSaveProject: () => void;
    onLoadProjectClick: () => void;
    onResetProject: () => void;
    onOpenImportModal: () => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
    onSaveProject,
    onLoadProjectClick,
    onResetProject,
    onOpenImportModal,
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3">
                <SaveIcon className="h-6 w-6" />
                Gerenciamento de Projeto
            </h2>
            <p className="text-sm text-gray-400">
                Salve seu progresso em um arquivo para fazer backup ou continuar mais tarde. Você também pode carregar um projeto existente.
            </p>
            <div className="pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={onSaveProject}
                        className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-green-800/50 text-white font-bold py-3 px-4 rounded-lg transition border border-gray-600 hover:border-green-600"
                        aria-label="Salvar projeto em arquivo"
                    >
                        <DownloadIcon className="h-5 w-5" /> Salvar Projeto
                    </button>
                    <button
                        onClick={onLoadProjectClick}
                        className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-blue-800/50 text-white font-bold py-3 px-4 rounded-lg transition border border-gray-600 hover:border-blue-600"
                        aria-label="Carregar projeto de arquivo"
                    >
                        <LoadIcon className="h-5 w-5" /> Carregar de Arquivo
                    </button>
                    <button
                        onClick={onOpenImportModal}
                        className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-purple-800/50 text-white font-bold py-3 px-4 rounded-lg transition border border-gray-600 hover:border-purple-600"
                        aria-label="Importar projeto de texto"
                    >
                        <FileTextIcon className="h-5 w-5" /> Importar de Texto
                    </button>
                    <button
                        onClick={onResetProject}
                        className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-red-800/50 text-white font-bold py-3 px-4 rounded-lg transition border border-gray-600 hover:border-red-600"
                        aria-label="Limpar projeto"
                    >
                        <TrashIcon className="h-5 w-5" /> Limpar Projeto
                    </button>
                </div>
            </div>
        </div>
    );
};
