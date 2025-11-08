import React from 'react';
import type { Speaker } from '../types';
import { VOICES } from '../constants';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

interface Step2Props {
    speakers: Speaker[];
    onUpdateSpeaker: (itemId: number, field: keyof Speaker, value: any) => void;
    onAddSpeaker: () => void;
    onRemoveSpeaker: (id: number) => void;
    hasDuplicateSpeakerNames: boolean;
}

export const Step2_Speakers: React.FC<Step2Props> = ({
    speakers,
    onUpdateSpeaker,
    onAddSpeaker,
    onRemoveSpeaker,
    hasDuplicateSpeakerNames,
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm">2</span> Apresentadores</h2>
            {speakers.map((s, i) => (
                <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-900/50 p-3 rounded-lg">
                    <input type="text" value={s.name} onChange={e => onUpdateSpeaker(s.id, 'name', e.target.value)} placeholder={`Nome ${i + 1}`} className="bg-gray-800 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                    <input type="text" value={s.personality} onChange={e => onUpdateSpeaker(s.id, 'personality', e.target.value)} placeholder="Personalidade / Tom de voz" className="bg-gray-800 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                    <div className="flex items-center gap-2">
                        <select value={s.voiceId} onChange={e => onUpdateSpeaker(s.id, 'voiceId', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                            {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        <button onClick={() => onRemoveSpeaker(s.id)} disabled={speakers.length <= 1} className="p-2 text-gray-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon /></button>
                    </div>
                </div>
            ))}
            {hasDuplicateSpeakerNames && <p className="text-xs text-yellow-400">Atenção: Nomes de apresentadores duplicados podem causar erros na narração.</p>}
            {speakers.length > 2 && <p className="text-xs text-yellow-400">Atenção: A narração de áudio suporta no máximo 2 apresentadores. Apenas os dois primeiros da lista serão usados para gerar a voz.</p>}
            <button onClick={onAddSpeaker} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-3 rounded-lg"><PlusIcon /> Adicionar Apresentador</button>
        </div>
    );
};
