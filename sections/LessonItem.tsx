
import React from 'react';
import type { Segment } from '../types';
import AudioPlayer from '../components/AudioPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ChevronUpIcon } from '../components/icons/ChevronUpIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { LightbulbIcon } from '../components/icons/LightbulbIcon';
import { SpeakerIcon } from '../components/icons/SpeakerIcon';
import { StatusIndicator } from '../components/StatusIndicator';

interface SegmentItemProps {
    segment: Segment;
    index: number;
    isLoadingContent: boolean;
    isLoadingNarration: boolean;
    activeTab: 'script' | 'points' | 'activity';
    onUpdate: <TKey extends keyof Segment>(field: TKey, value: Segment[TKey]) => void;
    onRemove: () => void;
    onToggle: () => void;
    onGenerateContent: () => void;
    onNarrate: () => void;
    onSetActiveTab: (tab: 'script' | 'points' | 'activity') => void;
}

export const LessonItem: React.FC<SegmentItemProps> = ({
    segment,
    index,
    isLoadingContent,
    isLoadingNarration,
    activeTab,
    onUpdate,
    onRemove,
    onToggle,
    onGenerateContent,
    onNarrate,
    onSetActiveTab,
}) => {
    const getStatus = (): 'empty' | 'script' | 'audio' => {
        if (segment.generatedAudio) {
            return 'audio';
        }
        if (segment.content && segment.content.trim() !== '') {
            return 'script';
        }
        return 'empty';
    };
    
    return (
        <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50">
            <div className="flex justify-between items-center cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <StatusIndicator status={getStatus()} />
                    <h3 className="font-semibold text-lg text-gray-300 truncate" title={segment.title}>{index + 1}. {segment.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                    {segment.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
            </div>
            {segment.isExpanded && (
                <div className="mt-4 space-y-4">
                    <input type="text" value={segment.title} onChange={e => onUpdate('title', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                    <textarea value={segment.description || ''} onChange={e => onUpdate('description', e.target.value)} placeholder="Anotações ou ideias para este segmento..." className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none" rows={2}></textarea>
                    <button onClick={onGenerateContent} disabled={isLoadingContent} className="w-full flex justify-center items-center gap-2 bg-indigo-800/50 hover:bg-indigo-800/80 text-white font-semibold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoadingContent ? <LoadingSpinner /> : <LightbulbIcon />} Gerar Roteiro para este Segmento
                    </button>
                    <div className="border-b border-gray-700">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {['script', 'points', 'activity'].map((tab) => (
                                <button key={tab} onClick={() => onSetActiveTab(tab as any)} className={`${activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                                    {tab === 'script' ? 'Roteiro' : tab === 'points' ? 'Pontos-chave' : 'Tópico'}
                                </button>
                            ))}
                        </nav>
                    </div>
                    {activeTab === 'script' && <textarea value={segment.content} onChange={e => onUpdate('content', e.target.value)} rows={8} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"></textarea>}
                    {activeTab === 'points' && <textarea value={segment.keyPoints || ''} onChange={e => onUpdate('keyPoints', e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"></textarea>}
                    {activeTab === 'activity' && <textarea value={segment.activitySuggestion || ''} onChange={e => onUpdate('activitySuggestion', e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"></textarea>}

                    <div className="bg-gray-800/70 p-3 rounded-lg space-y-3">
                        <button onClick={onNarrate} disabled={!segment.content || isLoadingNarration} className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoadingNarration ? <LoadingSpinner /> : <SpeakerIcon className="h-5 w-5" />} Narrar Segmento
                        </button>
                        {segment.generatedAudio && <AudioPlayer base64Pcm={segment.generatedAudio} />}
                    </div>
                </div>
            )}
        </div>
    );
};
