
import React, { ChangeEvent } from 'react';
import { UploadIcon } from '../components/icons/UploadIcon';
import { PaperclipIcon } from '../components/icons/PaperclipIcon';
import { GoogleDriveIcon } from '../components/icons/GoogleDriveIcon';
import LoadingSpinner from '../components/LoadingSpinner';

interface Step1Props {
    podcastIdea: string;
    setPodcastIdea: (value: string) => void;
    podcastSources: string;
    setPodcastSources: (value: string) => void;
    uploadedFileNames: string[];
    isDraggingOver: boolean;
    isLoading: boolean;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onDriveImport: () => void;
    onDriveHelp: () => void;
}

export const Step1_IdeaAndSources: React.FC<Step1Props> = ({
    podcastIdea,
    setPodcastIdea,
    podcastSources,
    setPodcastSources,
    uploadedFileNames,
    isDraggingOver,
    isLoading,
    onFileChange,
    onDriveImport,
    onDriveHelp,
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm">1</span> Tema & Fontes do Podcast</h2>
            <textarea value={podcastIdea} onChange={e => setPodcastIdea(e.target.value)} placeholder="Ex: Um podcast sobre a história da exploração espacial..." className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" rows={2}></textarea>
            <textarea value={podcastSources} onChange={e => setPodcastSources(e.target.value)} placeholder="Cole aqui textos, artigos ou anotações para dar contexto à IA..." className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition mt-2" rows={4}></textarea>

            <div className={`relative border-2 border-dashed  rounded-lg p-6 text-center space-y-3 transition-colors duration-200 ${isDraggingOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600'}`}>
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <p className="text-gray-400">Arraste e solte arquivos aqui</p>
                <p className="text-xs text-gray-500">ou</p>
                <div className="flex flex-wrap gap-3 items-center justify-center">
                    <label htmlFor="file-upload" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition">
                        {isLoading ? <LoadingSpinner /> : <PaperclipIcon />} <span>Carregar Arquivo</span>
                    </label>
                    <input id="file-upload" type="file" multiple className="hidden" onChange={onFileChange} disabled={isLoading} />
                     <button onClick={onDriveImport} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition">
                        <GoogleDriveIcon /> <span>Importar do Drive</span>
                    </button>
                </div>
                 <p className="text-xs text-gray-500 pt-2">
                    Formatos suportados: .pdf, .docx, .xlsx, .txt, .md. 
                    <button onClick={onDriveHelp} className="text-indigo-400 hover:underline ml-1">Como usar arquivos do Google Docs?</button>
                 </p>
            </div>

            {uploadedFileNames.length > 0 && <p className="text-xs text-gray-400 italic mt-2">Arquivos carregados: {uploadedFileNames.join(', ')}</p>}
        </div>
    );
};
