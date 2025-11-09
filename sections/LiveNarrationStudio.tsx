import React, { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Speaker } from '../types';
import { SaveIcon } from '../components/icons/SaveIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { SendIcon } from '../components/icons/SendIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

type ChatEntry = {
    speaker: 'Você' | string;
    text: string;
};

type SessionStatus = 'idle' | 'thinking' | 'error' | 'ended';

interface LiveScriptingStudioProps {
    apiKey: string;
    speakers: Speaker[];
    onSessionEnd: (transcript: string) => void;
    onError: (message: string) => void;
}

export const LiveScriptingStudio: React.FC<LiveScriptingStudioProps> = ({ apiKey, speakers, onSessionEnd, onError }) => {
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<number>(speakers[0]?.id || 0);
    const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
    const [userInput, setUserInput] = useState('');
    
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const selectedSpeaker = speakers.find(s => s.id === selectedSpeakerId) || speakers[0];

    useEffect(() => {
        // Rola para o final do chat quando novas mensagens chegam
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    const handleResetChat = () => {
        chatRef.current = null;
        setChatHistory([]);
        setStatus('idle');
        setUserInput('');
    };

    const handleSendMessage = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !selectedSpeaker) return;
        
        setStatus('thinking');
        onError('');
        
        const currentUserInput = userInput;
        setUserInput('');
        setChatHistory(prev => [...prev, { speaker: 'Você', text: currentUserInput }]);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-pro',
                    config: {
                         systemInstruction: `Você é um co-apresentador de podcast chamado ${selectedSpeaker.name}. Sua personalidade é: ${selectedSpeaker.personality || 'neutra'}. Converse com o usuário de forma natural e ajude a construir o roteiro do podcast. Responda apenas com a sua fala, sem usar formatação como markdown ou prefixos de nome.`,
                    }
                });
            }

            const stream = await chatRef.current.sendMessageStream({ message: currentUserInput });
            
            let fullResponse = '';
            // Adiciona um placeholder para a resposta da IA
            setChatHistory(prev => [...prev, { speaker: selectedSpeaker.name, text: '' }]);

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                // Atualiza a última entrada (a resposta da IA) com o novo texto
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text = fullResponse;
                    return newHistory;
                });
            }

            setStatus('idle');

        } catch (err: any) {
            console.error("Falha ao enviar mensagem:", err);
            onError(`Erro no chat: ${err.message}.`);
            setStatus('error');
            // Remove a mensagem do usuário se a IA falhou em responder
            setChatHistory(prev => prev.slice(0, -1));
        }
    }, [apiKey, selectedSpeaker, userInput, onError]);

    const saveTranscript = () => {
        const formattedTranscript = chatHistory
            .map(entry => `${entry.speaker}: ${entry.text}`)
            .join('\n\n');
        onSessionEnd(formattedTranscript);
        handleResetChat();
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Estúdio de Roteiro Interativo
            </h2>
            <p className="text-sm text-gray-400">
                Converse com a IA em tempo real para criar um roteiro. A transcrição pode ser salva como um novo segmento.
            </p>

            <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700/50 min-h-[200px] max-h-[400px] overflow-y-auto space-y-4 flex flex-col" ref={chatContainerRef}>
                {chatHistory.length === 0 ? (
                    <p className="text-gray-500 italic text-center m-auto">O chat está vazio. Selecione um apresentador e envie uma mensagem para começar.</p>
                ) : (
                    chatHistory.map((entry, index) => (
                         <div key={index} className={`flex ${entry.speaker === 'Você' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg ${entry.speaker === 'Você' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                <p className="text-sm font-bold mb-1 ${entry.speaker === 'Você' ? 'text-indigo-200' : 'text-purple-300'}">{entry.speaker}</p>
                                <p className="text-gray-200 whitespace-pre-wrap">{entry.text}{status === 'thinking' && index === chatHistory.length - 1 && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full">
                    <label htmlFor="speaker-select" className="block text-sm font-medium text-gray-300 mb-1">IA irá atuar como:</label>
                    <select
                        id="speaker-select"
                        value={selectedSpeakerId}
                        onChange={e => {
                            setSelectedSpeakerId(Number(e.target.value));
                            handleResetChat(); // Reseta o chat ao trocar de apresentador
                        }}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                        {speakers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.personality})</option>)}
                    </select>
                </div>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={status === 'thinking' ? 'Aguarde a IA responder...' : 'Digite sua mensagem...'}
                    disabled={status === 'thinking'}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:opacity-50"
                />
                <button type="submit" disabled={!userInput.trim() || status === 'thinking'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     {status === 'thinking' ? <LoadingSpinner /> : <SendIcon />}
                </button>
            </form>
            
            {chatHistory.length > 0 && (
                <div className="flex justify-center gap-4 pt-2">
                    <button onClick={saveTranscript} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition">
                       <SaveIcon className="h-5 w-5" /> Salvar como Segmento
                    </button>
                    <button onClick={handleResetChat} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
                        <TrashIcon className="h-5 w-5" /> Limpar Chat
                    </button>
                </div>
            )}
        </div>
    );
};
