import React, { useState } from 'react';
import { FileTextIcon } from '../icons/FileTextIcon';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonText: string) => void;
}

const ImportProjectModal: React.FC<ImportProjectModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');

  if (!isOpen) return null;

  const handleImportClick = () => {
    onImport(jsonText);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-11/12 max-w-2xl text-gray-200 relative border border-gray-700 flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-200 text-2xl" aria-label="Fechar modal">&times;</button>
        <header className="mb-4">
            <h2 className="text-2xl font-bold text-indigo-400 mb-2 flex items-center gap-3">
                <FileTextIcon className="h-7 w-7"/>
                Importar Projeto de Texto
            </h2>
            <p className="text-gray-300">
              Cole o conteúdo de um arquivo de projeto (.json) na caixa de texto abaixo para carregar seu trabalho.
            </p>
            <p className="text-xs text-yellow-400 mt-2">Atenção: A importação substituirá todo o projeto atual.</p>
        </header>
        
        <main className="flex-grow flex flex-col">
            <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Cole o conteúdo JSON do seu projeto aqui..."
                className="w-full flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                rows={15}
                spellCheck="false"
            />
        </main>
        
        <footer className="mt-6 text-center">
          <button 
            onClick={handleImportClick}
            disabled={!jsonText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Importar e Carregar Projeto
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ImportProjectModal;