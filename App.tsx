import React, { useState, useCallback, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { generatePodcastStructure, getSegmentContent, generateMultiSpeakerSpeech } from './services/geminiService';
import { parseFile, getFileContent } from './services/fileParsers';
import { showPicker as showDrivePicker } from './services/googleDriveService';
import { createWavBlob } from './utils/audioUtils';
import type { Segment, Speaker } from './types';
import HelpModal from './components/modals/HelpModal';
import ApiKeyModal from './components/modals/ApiKeyModal';
import GoogleDriveModal from './components/modals/GoogleDriveModal';
import { Header } from './sections/Header';
import { Step1_IdeaAndSources } from './sections/Step1_IdeaAndSources';
import { Step2_Speakers } from './sections/Step2_Speakers';
import { Step3_Segments } from './sections/Step3_Segments';
import { Step4_Export } from './sections/Step4_Export';
import { UploadIcon } from './components/icons/UploadIcon';
import { VOICES } from './constants';
import { ProjectManagement } from './sections/ProjectManagement';
import ImportProjectModal from './components/modals/ImportProjectModal';
import LoadingSpinner from './components/LoadingSpinner';
import { LiveScriptingStudio } from './sections/LiveNarrationStudio';

const PROJECT_STATE_KEY = 'ia-podcast-narrator-state';
const API_KEY_LOCAL_STORAGE_KEY = 'gemini-api-key';

const defaultSpeakers: Speaker[] = [
    { id: Date.now(), name: 'Apresentador', voiceId: VOICES[0].id, personality: 'Entusiasmado e didático' },
    { id: Date.now() + 1, name: 'Convidado', voiceId: VOICES[1].id, personality: 'Curioso e questionador' },
];


const App: React.FC = () => {
    const [isStateLoaded, setIsStateLoaded] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [podcastIdea, setPodcastIdea] = useState('');
    const [podcastSources, setPodcastSources] = useState('');
    const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);
    const [isLoading, setIsLoading] = useState({
        structure: false,
        content: {} as Record<number, boolean>,
        allContent: false,
        narration: {} as Record<number, boolean>,
        fullNarration: false,
        parsingFiles: false,
    });
    const [isLoadingScript, setIsLoadingScript] = useState<number | null>(null);
    const [allContentProgress, setAllContentProgress] = useState({ current: 0, total: 0, title: '' });
    const [narrationProgress, setNarrationProgress] = useState({ current: 0, total: 0, title: '' });
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Record<number, 'script' | 'points' | 'activity'>>({});
    const [fullPodcastAudio, setFullPodcastAudio] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
    const [targetSegmentForScript, setTargetSegmentForScript] = useState<number | null>(null);
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const dragCounter = useRef(0);
    const loadProjectInputRef = useRef<HTMLInputElement>(null);
    const loadScriptInputRef = useRef<HTMLInputElement>(null);
    const wakeLockSentinel = useRef<any>(null);
    
    // --- Wake Lock API Logic ---
    const acquireWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockSentinel.current = await navigator.wakeLock.request('screen');
                setIsWakeLockActive(true);
                console.log('Wake Lock ativado.');

                // Adiciona um listener para caso o lock seja liberado pelo sistema (ex: aba em segundo plano)
                // para que a UI possa ser atualizada.
                wakeLockSentinel.current.addEventListener('release', () => {
                    setIsWakeLockActive(false);
                    console.log('Wake Lock liberado: a tela pode desligar agora.');
                });
            } catch (err: any) {
                // Um 'NotAllowedError' é esperado em ambientes restritos como iframes.
                // Em vez de registrar um erro assustador, registramos um aviso informativo,
                // pois o aplicativo pode continuar a funcionar normalmente sem ele.
                if (err.name === 'NotAllowedError') {
                    console.warn('A permissão para Wake Lock foi negada. A tela pode desligar durante processos longos. Isso é normal em alguns ambientes de navegador.');
                } else {
                    console.error(`Não foi possível ativar o Wake Lock: ${err.name}, ${err.message}`);
                }
            }
        } else {
            console.warn('A API Wake Lock não é suportada neste navegador.');
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockSentinel.current) {
            try {
                await wakeLockSentinel.current.release();
                wakeLockSentinel.current = null;
                setIsWakeLockActive(false);
                console.log('Wake Lock liberado.');
            } catch (err: any) {
                 console.error(`Não foi possível liberar o Wake Lock: ${err.name}, ${err.message}`);
            }
        }
    }, []);


    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    useEffect(() => {
        try {
            const savedApiKey = localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY);
            if (savedApiKey) {
                setApiKey(savedApiKey);
            }

            const savedProject = localStorage.getItem(PROJECT_STATE_KEY);
            if (savedProject) {
                const parsedState = JSON.parse(savedProject);
                setPodcastIdea(parsedState.podcastIdea || '');
                setPodcastSources(parsedState.podcastSources || '');
                setUploadedFileNames(parsedState.uploadedFileNames || []);
                if (parsedState.segments && Array.isArray(parsedState.segments)) {
                   setSegments(parsedState.segments.map((s: Omit<Segment, 'isExpanded'>) => ({ ...s, isExpanded: false })));
                }
                setSpeakers(parsedState.speakers?.length > 0 ? parsedState.speakers : defaultSpeakers);
            }
        } catch (e) {
            console.error("Falha ao carregar estado do localStorage", e);
            localStorage.removeItem(PROJECT_STATE_KEY); // Limpa estado corrompido
        } finally {
            setIsStateLoaded(true);
        }
    }, []);
    
    useEffect(() => {
        if (!isStateLoaded) return;
        try {
            const stateToSave = {
                podcastIdea,
                podcastSources,
                uploadedFileNames,
                speakers,
                segments: segments.map(({ isExpanded, ...rest }) => rest),
            };
            localStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            console.error("Não foi possível salvar o estado no localStorage", e);
        }
    }, [podcastIdea, podcastSources, uploadedFileNames, speakers, segments, isStateLoaded]);

    useEffect(() => {
        if (!isStateLoaded) return;
        if (apiKey) {
            localStorage.setItem(API_KEY_LOCAL_STORAGE_KEY, apiKey);
        } else {
            localStorage.removeItem(API_KEY_LOCAL_STORAGE_KEY);
        }
    }, [apiKey, isStateLoaded]);

    const handleInstallClick = async () => {
        if (!installPromptEvent) return;
        // The type assertion is necessary because the prompt() method is specific to BeforeInstallPromptEvent
        await (installPromptEvent as any).prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await (installPromptEvent as any).userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and it can't be used again, discard it
        setInstallPromptEvent(null);
    };

    const hasDuplicateSpeakerNames = useMemo(() => {
        const names = speakers.map(s => s.name.trim().toLowerCase());
        return new Set(names).size !== names.length;
    }, [speakers]);
    
    const handleApiError = (error: any) => {
        const message = error.message || 'Ocorreu um erro desconhecido.';
        if (message.includes('API key not valid') || message.includes('API_KEY') || message.includes('permission')) {
             setError('Sua chave de API é inválida ou expirou. Por favor, insira uma nova chave.');
             setApiKey(null);
        } else {
            setError(message);
        }
    };
    
    const handleSaveApiKey = (key: string) => {
        if (key && key.trim()) {
            setApiKey(key.trim());
            setError(null);
        } else {
            setError("A chave de API não pode estar vazia.");
        }
    };

    const handleUpdateField = <TItem extends { id: number }, TKey extends keyof TItem>(
        setState: React.Dispatch<React.SetStateAction<TItem[]>>,
        itemId: number,
        field: TKey,
        value: TItem[TKey]
    ) => {
        setState(prev => prev.map(item => (item.id === itemId ? { ...item, [field]: value } : item)));
    };

    const handleAddSegment = () => setSegments(prev => [...prev, { id: Date.now(), title: `Novo Segmento ${prev.length + 1}`, content: '', isExpanded: true }]);
    const handleRemoveSegment = (id: number) => setSegments(prev => prev.filter(l => l.id !== id));
    const handleAddSpeaker = () => setSpeakers(prev => [...prev, { id: Date.now(), name: `Apresentador ${prev.length + 1}`, voiceId: VOICES[2]?.id || VOICES[0].id, personality: 'Neutro e informativo' }]);
    const handleRemoveSpeaker = (id: number) => setSpeakers(prev => prev.filter(s => s.id !== id));
    
    const handleResetProject = () => {
        if (window.confirm("Tem certeza de que deseja limpar todo o projeto? Esta ação não pode ser desfeita.")) {
            localStorage.removeItem(PROJECT_STATE_KEY);
            window.location.reload();
        }
    };

    const handleSaveProject = useCallback(() => {
        try {
            const stateToSave = {
                podcastIdea,
                podcastSources,
                uploadedFileNames,
                speakers,
                segments: segments.map(({ isExpanded, ...rest }) => rest),
            };
            const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const fileName = (podcastIdea || 'podcast_project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error("Não foi possível salvar o projeto", e);
            setError("Não foi possível salvar o projeto em um arquivo.");
        }
    }, [podcastIdea, podcastSources, uploadedFileNames, speakers, segments]);

    const handleLoadProject = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("Carregar um projeto substituirá seu trabalho atual. Tem certeza?")) {
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedState = JSON.parse(event.target?.result as string);
                if (!loadedState.segments || !loadedState.speakers) {
                    throw new Error("Arquivo de projeto inválido ou corrompido.");
                }
                localStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(loadedState));
                window.location.reload();
            } catch (err: any) {
                setError(`Falha ao carregar o projeto: ${err.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }, []);

    const handleLoadProjectClick = () => {
        loadProjectInputRef.current?.click();
    };

    const handleImportFromText = useCallback((jsonText: string) => {
        if (!jsonText.trim()) {
            setError("A caixa de texto de importação está vazia.");
            return;
        }
        if (!window.confirm("Importar um projeto substituirá seu trabalho atual. Tem certeza?")) {
            return;
        }
        setError(null);
        try {
            const loadedState = JSON.parse(jsonText);
            if (!loadedState.segments || !loadedState.speakers || typeof loadedState.podcastIdea === 'undefined') {
                throw new Error("Texto JSON do projeto inválido ou corrompido.");
            }
            localStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(loadedState));
            window.location.reload();
        } catch (err: any) {
            console.error("Falha ao importar o projeto", err);
            setError(`Falha ao importar o projeto do texto: ${err.message}`);
        }
    }, []);
    
    const processFiles = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;
        setError(null);
        setIsLoading(prev => ({ ...prev, parsingFiles: true }));
        try {
            const results = await Promise.allSettled(files.map(parseFile));
            const successfulContents = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<string>).value);
            const successfulNames = files.slice(0, results.length).filter((_, i) => results[i].status === 'fulfilled').map(f => f.name);
            const failedCount = results.filter(r => r.status === 'rejected').length;

            setPodcastSources(prev => `${prev}\n${successfulContents.join('\n')}`.trim());
            setUploadedFileNames(prev => [...new Set([...prev, ...successfulNames])]);
            if (failedCount > 0) throw new Error(`${failedCount} arquivo(s) não puderam ser processados.`);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(prev => ({ ...prev, parsingFiles: false }));
        }
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(Array.from(e.target.files));
        e.target.value = '';
    };

    const handleLoadScriptClick = (segmentId: number) => {
        setTargetSegmentForScript(segmentId);
        loadScriptInputRef.current?.click();
    };

    const handleLoadScriptFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || targetSegmentForScript === null) {
            if (e.target) e.target.value = '';
            return;
        };

        setIsLoadingScript(targetSegmentForScript);
        setError(null);
        try {
            const content = await getFileContent(file);
            handleUpdateField<Segment, 'content'>(setSegments, targetSegmentForScript, 'content', content);
        } catch (err: any) {
            setError(`Falha ao carregar roteiro: ${err.message}`);
        } finally {
            setIsLoadingScript(null);
            setTargetSegmentForScript(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleDriveImport = useCallback(async () => {
        if (!apiKey) {
            setError("A chave de API do Google é necessária para usar o seletor do Drive.");
            return;
        }
        try {
            const files = await showDrivePicker(apiKey);
            if (files.length > 0) {
                await processFiles(files);
            }
        } catch (error: any) {
            console.error("Erro ao importar do Google Drive:", error);
            setError(`Falha ao importar do Google Drive: ${error.message}`);
        }
    }, [apiKey, processFiles]);
    
    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDraggingOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    }, [processFiles]);

    const handleGenerateStructure = useCallback(async () => {
        if (!apiKey) return;
        setError(null);
        setIsLoading(prev => ({ ...prev, structure: true }));
        try {
            const newSegments = await generatePodcastStructure(podcastIdea, apiKey);
            setSegments(newSegments);
        } catch (e: any) {
            handleApiError(e);
        } finally {
            setIsLoading(prev => ({ ...prev, structure: false }));
        }
    }, [podcastIdea, apiKey]);

    const handleGenerateSegmentContent = useCallback(async (segmentId: number) => {
        if (!apiKey) return;
        const segment = segments.find(l => l.id === segmentId);
        if (!segment) return;
        setError(null);
        setIsLoading(prev => ({ ...prev, content: { ...prev.content, [segmentId]: true } }));
        try {
            const content = await getSegmentContent(apiKey, podcastIdea, segment.title, speakers, podcastSources, segment.description);
            handleUpdateField<Segment, 'content'>(setSegments, segmentId, 'content', content.content || '');
            handleUpdateField<Segment, 'keyPoints'>(setSegments, segmentId, 'keyPoints', content.keyPoints || '');
            handleUpdateField<Segment, 'activitySuggestion'>(setSegments, segmentId, 'activitySuggestion', content.activitySuggestion || '');
        } catch (e: any) {
            handleApiError(e);
        } finally {
            setIsLoading(prev => ({ ...prev, content: { ...prev.content, [segmentId]: false } }));
        }
    }, [segments, podcastIdea, speakers, podcastSources, apiKey]);

    const handleGenerateAllContent = useCallback(async () => {
        if (!apiKey) return;
        setError(null);
        setIsLoading(prev => ({ ...prev, allContent: true }));
        setAllContentProgress({ current: 0, total: segments.length, title: '' });
    
        await acquireWakeLock();
        try {
            let generatedCount = 0;
            let currentSegments = segments;
        
            for (const [index, segment] of segments.entries()) {
                setAllContentProgress({ current: index + 1, total: segments.length, title: segment.title });
                try {
                    const content = await getSegmentContent(apiKey, podcastIdea, segment.title, speakers, podcastSources, segment.description);
                    
                    currentSegments = currentSegments.map(s =>
                        s.id === segment.id ? { ...s, ...content } : s
                    );
    
                    setSegments(currentSegments);
                    generatedCount++;
                } catch (error) {
                    console.error(`Falha ao gerar conteúdo para "${segment.title}":`, error);
                    handleApiError(error);
                    break;
                }
            }
        
            if (generatedCount < segments.length && !error) {
                setError("Alguns conteúdos não puderam ser gerados. Tente novamente para os segmentos individuais.");
            }
        } finally {
            setIsLoading(prev => ({ ...prev, allContent: false }));
            await releaseWakeLock();
        }
    }, [segments, podcastIdea, speakers, podcastSources, error, apiKey, acquireWakeLock, releaseWakeLock]);

    const handleNarrateSegment = useCallback(async (segmentId: number) => {
        if (!apiKey) return;
        const segment = segments.find(l => l.id === segmentId);
        if (!segment || !segment.content) {
            setError("O roteiro do segmento está vazio.");
            return;
        }
        if (hasDuplicateSpeakerNames) {
            setError("Nomes de apresentadores não podem ser duplicados.");
            return;
        }
        setError(null);
        setFullPodcastAudio(null);
        setIsLoading(prev => ({ ...prev, narration: { ...prev.narration, [segmentId]: true } }));
        try {
            const audioB64 = await generateMultiSpeakerSpeech(apiKey, segment.content, speakers);
            handleUpdateField<Segment, 'generatedAudio'>(setSegments, segmentId, 'generatedAudio', audioB64);
        } catch (e: any) {
            handleApiError(e);
        } finally {
            setIsLoading(prev => ({ ...prev, narration: { ...prev.narration, [segmentId]: false } }));
        }
    }, [segments, speakers, hasDuplicateSpeakerNames, apiKey]);

    const handleGenerateFullPodcastAudio = useCallback(async () => {
        if (!apiKey) return;
        setError(null);
        if (hasDuplicateSpeakerNames) {
            setError("Corrija os nomes de apresentadores duplicados antes de continuar.");
            return;
        }
    
        setIsLoading(prev => ({ ...prev, fullNarration: true }));
        setFullPodcastAudio(null);
    
        const segmentsToProcess = segments.filter(l => l.content);
    
        if (segmentsToProcess.length === 0) {
            setError("Nenhum segmento tem roteiro para ser narrado.");
            setIsLoading(prev => ({ ...prev, fullNarration: false }));
            return;
        }
    
        setNarrationProgress({ current: 0, total: segmentsToProcess.length, title: '' });
        
        await acquireWakeLock();
        try {
            let updatedSegments = segments;
            let narrationErrorCount = 0;
        
            for (const [index, segment] of segmentsToProcess.entries()) {
                setNarrationProgress({ current: index + 1, total: segmentsToProcess.length, title: segment.title });
                
                if (segment.content && !segment.generatedAudio) {
                    try {
                        const audioB64 = await generateMultiSpeakerSpeech(apiKey, segment.content, speakers);
                        
                        updatedSegments = updatedSegments.map(s =>
                            s.id === segment.id ? { ...s, generatedAudio: audioB64 } : s
                        );
                        setSegments(updatedSegments);
                    } catch (error) {
                        console.error(`Falha ao narrar o segmento "${segment.title}":`, error);
                        narrationErrorCount++;
                        handleApiError(error);
                        break; 
                    }
                }
            }
            
            const allAudioParts = updatedSegments
                .filter(segment => segment.generatedAudio)
                .map(segment => segment.generatedAudio!);
        
            if (allAudioParts.length > 0) {
                const combinedAudio = allAudioParts.join('');
                setFullPodcastAudio(combinedAudio);
            } else if (narrationErrorCount === 0) {
                 setError("Nenhum áudio pôde ser gerado.");
            }
            
            if (narrationErrorCount > 0 && !error) {
                setError(`Não foi possível narrar ${narrationErrorCount} segmento(s). Verifique os roteiros e tente novamente.`);
            }
        } finally {
            setIsLoading(prev => ({ ...prev, fullNarration: false }));
            await releaseWakeLock();
        }
    }, [segments, speakers, hasDuplicateSpeakerNames, error, apiKey, acquireWakeLock, releaseWakeLock]);

    const handleExportText = useCallback(() => {
        let fullText = `# ${podcastIdea || 'Podcast Sem Título'}\n\n`;
        if (podcastSources.trim()) fullText += `## Fontes\n${podcastSources}\n\n---\n\n`;
        segments.forEach((segment, index) => {
            fullText += `## Segmento ${index + 1}: ${segment.title}\n\n`;
            if (segment.description) fullText += `### Anotações\n${segment.description}\n\n`;
            if (segment.content) fullText += `### Roteiro\n${segment.content}\n\n`;
            if (segment.keyPoints) fullText += `### Pontos-chave\n${segment.keyPoints}\n\n`;
            if (segment.activitySuggestion) fullText += `### Tópico Sugerido\n${segment.activitySuggestion}\n\n`;
            fullText += '---\n\n';
        });
        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${(podcastIdea || 'podcast').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roteiro.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    }, [podcastIdea, podcastSources, segments]);

    const handleExportZip = useCallback(async () => {
        setError(null);
        try {
            const zip = new (window as any).JSZip();
            const segmentsWithAudio = segments.filter(l => l.generatedAudio);
            if (segmentsWithAudio.length === 0) throw new Error("Nenhum áudio foi gerado para exportar.");
            
            segmentsWithAudio.forEach((segment, index) => {
                const wavBlob = createWavBlob(segment.generatedAudio!);
                const fileName = `segmento_${String(index + 1).padStart(2, '0')}_${segment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
                zip.file(fileName, wavBlob);
            });
            
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `${(podcastIdea || 'podcast').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_audios.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e: any) {
            setError(e.message);
        }
    }, [segments, podcastIdea]);

    const handleAddLiveTranscriptAsSegment = useCallback((transcript: string) => {
        const newSegment: Segment = {
            id: Date.now(),
            title: `Segmento Interativo - ${new Date().toLocaleTimeString()}`,
            content: transcript,
            isExpanded: true,
            description: 'Este roteiro foi gerado a partir de uma sessão de roteiro interativo.',
        };
        setSegments(prev => [...prev, newSegment]);
    }, []);

    if (!isStateLoaded) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner className="h-12 w-12" />
                    <p className="text-gray-400">Carregando projeto...</p>
                </div>
            </div>
        );
    }

    if (!apiKey) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <ApiKeyModal
                    isOpen={true}
                    onSave={handleSaveApiKey}
                    error={error}
                    clearError={() => setError(null)}
                    onInstall={handleInstallClick}
                    showInstallButton={!!installPromptEvent}
                />
            </div>
        );
    }

    return (
        <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 md:p-8">
            {isDraggingOver && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 pointer-events-none">
                     <UploadIcon className="h-20 w-20 text-indigo-400" />
                     <p className="mt-4 text-2xl font-bold text-gray-200">Solte os arquivos para carregar</p>
                </div>
            )}
            <div className="w-full max-w-[700px] mx-auto space-y-8">
                <Header 
                    onOpenHelp={() => setIsHelpModalOpen(true)}
                    onApiKeyEdit={() => setApiKey(null)}
                    onInstall={handleInstallClick}
                    showInstallButton={!!installPromptEvent}
                />
                 <input
                    type="file"
                    ref={loadProjectInputRef}
                    onChange={handleLoadProject}
                    className="hidden"
                    accept=".json"
                />
                 <input
                    type="file"
                    ref={loadScriptInputRef}
                    onChange={handleLoadScriptFile}
                    className="hidden"
                    accept=".txt,.md,.docx,.pdf,.text"
                />

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                        <strong className="font-bold">Erro: </strong>
                        <span className="block sm:inline">{error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                            <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </span>
                    </div>
                )}
                
                <ProjectManagement
                    onSaveProject={handleSaveProject}
                    onLoadProjectClick={handleLoadProjectClick}
                    onResetProject={handleResetProject}
                    onOpenImportModal={() => setIsImportModalOpen(true)}
                />

                <Step1_IdeaAndSources
                    podcastIdea={podcastIdea}
                    setPodcastIdea={setPodcastIdea}
                    podcastSources={podcastSources}
                    setPodcastSources={setPodcastSources}
                    uploadedFileNames={uploadedFileNames}
                    isDraggingOver={isDraggingOver}
                    isLoading={isLoading.parsingFiles}
                    onFileChange={handleFileChange}
                    onDriveImport={handleDriveImport}
                    onDriveHelp={() => setIsDriveModalOpen(true)}
                />
                
                <Step2_Speakers
                    speakers={speakers}
                    onUpdateSpeaker={(itemId, field, value) => handleUpdateField(setSpeakers, itemId, field, value)}
                    onAddSpeaker={handleAddSpeaker}
                    onRemoveSpeaker={handleRemoveSpeaker}
                    hasDuplicateSpeakerNames={hasDuplicateSpeakerNames}
                />

                <LiveScriptingStudio
                    apiKey={apiKey}
                    speakers={speakers}
                    onSessionEnd={handleAddLiveTranscriptAsSegment}
                    onError={setError}
                />

                <Step3_Segments
                    segments={segments}
                    isLoading={isLoading}
                    podcastIdea={podcastIdea}
                    onGenerateStructure={handleGenerateStructure}
                    onGenerateAllContent={handleGenerateAllContent}
                    allContentProgress={allContentProgress}
                    onAddSegment={handleAddSegment}
                    onRemoveSegment={handleRemoveSegment}
                    onUpdateSegment={(itemId, field, value) => handleUpdateField(setSegments, itemId, field, value)}
                    onGenerateSegmentContent={handleGenerateSegmentContent}
                    onNarrateSegment={handleNarrateSegment}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isLoadingScript={isLoadingScript}
                    onLoadScriptForSegment={handleLoadScriptClick}
                    isWakeLockActive={isWakeLockActive}
                />

                <Step4_Export
                    segments={segments}
                    isLoading={isLoading.fullNarration}
                    onGenerateFullAudio={handleGenerateFullPodcastAudio}
                    narrationProgress={narrationProgress}
                    fullPodcastAudio={fullPodcastAudio}
                    onExportZip={handleExportZip}
                    onExportText={handleExportText}
                    isWakeLockActive={isWakeLockActive}
                />
            </div>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            <ImportProjectModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportFromText}
            />
             <GoogleDriveModal 
                isOpen={isDriveModalOpen}
                onClose={() => setIsDriveModalOpen(false)}
            />
        </div>
    );
};

export default App;