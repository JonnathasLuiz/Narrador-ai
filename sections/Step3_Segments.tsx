
import React from 'react';
import type { Segment } from '../types';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { ListIcon } from '../components/icons/ListIcon';
import { MagicIcon } from '../components/icons/MagicIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { LessonItem as SegmentItem } from './LessonItem';

interface Step3Props {
    segments: Segment[];
    isLoading: {
        structure: boolean;
        allContent: boolean;
        content: Record<number, boolean>;
        narration: Record<number, boolean>;
    };
    podcastIdea: string;
    onGenerateStructure: () => void;
    onGenerateAllContent: () => void;
    allContentProgress: { current: number; total: number; title: string; };
    onAddSegment: () => void;
    onRemoveSegment: (id: number) => void;
    onUpdateSegment: (itemId: number, field: keyof Segment, value: any) => void;
    onGenerateSegmentContent: (id: number) => void;
    onNarrateSegment: (id: number) => void;
    activeTab: Record<number, 'script' | 'points' | 'activity'>;
    setActiveTab: React.Dispatch<React.SetStateAction<Record<number, 'script' | 'points' | 'activity'>>>;
    isLoadingScript: number | null;
    onLoadScriptForSegment: (segmentId: number) => void;
}

export const Step3_Segments: React.FC<Step3Props> = ({
    segments,
    isLoading,
    podcastIdea,
    onGenerateStructure,
    onGenerateAllContent,
    allContentProgress,
    onAddSegment,
    onRemoveSegment,
    onUpdateSegment,
    onGenerateSegmentContent,
    onNarrateSegment,
    activeTab,
    setActiveTab,
    isLoadingScript,
    onLoadScriptForSegment
}) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3"><span className="bg-indigo-500 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm">3</span> Segmentos do Podcast</h2>
                <div className="flex flex-wrap gap-3">
                    <button onClick={onGenerateStructure} disabled={!podcastIdea || isLoading.structure} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading.structure ? <LoadingSpinner /> : <ListIcon />} Gerar Estrutura
                    </button>
                    {segments.length > 0 && !isLoading.structure && (
                        <button onClick={onGenerateAllContent} disabled={isLoading.allContent} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading.allContent ? <LoadingSpinner /> : <MagicIcon />} Gerar Roteiro para Todos
                        </button>
                    )}
                </div>
            </div>
            {isLoading.allContent && (
                <ProgressBar
                    current={allContentProgress.current}
                    total={allContentProgress.total}
                    text={`Gerando: ${allContentProgress.title}`}
                />
            )}
            {segments.length > 0 && (
                <div className="space-y-4 pt-4">
                    {segments.map((segment, index) => (
                        <SegmentItem
                            key={segment.id}
                            segment={segment}
                            index={index}
                            isLoadingContent={isLoading.content[segment.id]}
                            isLoadingNarration={isLoading.narration[segment.id]}
                            isLoadingScript={isLoadingScript === segment.id}
                            activeTab={activeTab[segment.id] || 'script'}
                            onUpdate={(field, value) => onUpdateSegment(segment.id, field, value)}
                            onRemove={() => onRemoveSegment(segment.id)}
                            onToggle={() => onUpdateSegment(segment.id, 'isExpanded', !segment.isExpanded)}
                            onGenerateContent={() => onGenerateSegmentContent(segment.id)}
                            onNarrate={() => onNarrateSegment(segment.id)}
                            onSetActiveTab={(tab) => setActiveTab(prev => ({ ...prev, [segment.id]: tab }))}
                            onLoadScript={() => onLoadScriptForSegment(segment.id)}
                        />
                    ))}
                </div>
            )}
            <button onClick={onAddSegment} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-3 rounded-lg mt-4"><PlusIcon /> Adicionar Segmento Manualmente</button>
        </div>
    );
};
