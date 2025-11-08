import React from 'react';
import { GoogleDriveIcon } from '../icons/GoogleDriveIcon';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-11/12 max-w-2xl text-gray-200 relative border border-gray-700" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-200 text-2xl" aria-label="Fechar modal">&times;</button>
        <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-3">
          <GoogleDriveIcon className="h-7 w-7"/>
          Importando do Google Drive
        </h2>
        <p className="mb-6 text-gray-300">
          A importação direta não é suportada, mas você pode usar seus arquivos do Google em 2 passos:
        </p>
        <div className="space-y-4 text-gray-300">
            <details className="bg-gray-900/50 p-3 rounded-lg cursor-pointer">
                <summary className="font-semibold text-gray-200">1. Baixe o arquivo no formato correto</summary>
                <ul className="list-disc list-outside space-y-3 pl-5 mt-3 text-sm">
                  <li>
                    <strong>Google Docs:</strong> Abra o documento, vá em <code className="bg-gray-700 px-1 py-0.5 rounded text-indigo-300">Arquivo &gt; Fazer download</code> e escolha <code className="bg-gray-700 px-1 py-0.5 rounded text-indigo-300">Microsoft Word (.docx)</code>.
                  </li>
                  <li>
                    <strong>Google Sheets:</strong> Abra a planilha, vá em <code className="bg-gray-700 px-1 py-0.5 rounded text-indigo-300">Arquivo &gt; Fazer download</code> e escolha <code className="bg-gray-700 px-1 py-0.5 rounded text-indigo-300">Microsoft Excel (.xlsx)</code>.
                  </li>
                  <li>
                    <strong>PDFs e outros arquivos:</strong> Faça o download do arquivo normalmente para o seu computador.
                  </li>
                </ul>
            </details>
            <details className="bg-gray-900/50 p-3 rounded-lg cursor-pointer" open>
                <summary className="font-semibold text-gray-200">2. Carregue o arquivo baixado</summary>
                 <p className="mt-3 text-sm">
                    Após o download, retorne a esta tela e use o botão <code className="bg-gray-700 px-1 py-0.5 rounded text-indigo-300">Carregar Arquivo</code> para selecionar o arquivo que você acabou de salvar.
                </p>
            </details>
        </div>
        <div className="mt-8 text-center">
          <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveModal;
