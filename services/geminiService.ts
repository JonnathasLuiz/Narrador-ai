
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Speaker, Segment } from '../types';

export async function generatePodcastStructure(podcastIdea: string, apiKey: string): Promise<Segment[]> {
    if (!apiKey) throw new Error("A chave de API do Gemini é necessária.");
    const ai = new GoogleGenAI({ apiKey });
    const proModel = 'gemini-2.5-pro';
    
    const prompt = `Você é um produtor de podcast especialista. Crie uma estrutura detalhada para um podcast com a seguinte ideia: "${podcastIdea}".
Gere uma lista lógica de títulos de segmentos para este podcast.
Responda com um array JSON de strings, onde cada string é um título de segmento. Exemplo: ["Introdução ao Tema", "Desenvolvimento Principal", "Entrevista com Especialista", "Conclusão e Encerramento"]`;

    try {
         const response = await ai.models.generateContent({
            model: proModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const segmentTitles = JSON.parse(response.text);

        if (!Array.isArray(segmentTitles) || segmentTitles.length === 0) {
            throw new Error("A estrutura gerada não é válida.");
        }

        return segmentTitles.map((title, index) => ({
            id: Date.now() + index,
            title,
            content: '',
            isExpanded: true,
        }));
    } catch (error) {
        console.error("Erro ao gerar estrutura do podcast:", error);
        throw error;
    }
}

/**
 * Constrói o prompt para gerar o conteúdo de um segmento. Exportado para fins de teste.
 * @internal
 */
export function _buildContentPrompt(podcastIdea: string, segmentTitle: string, speakers: Speaker[], podcastSources?: string, segmentDescription?: string): string {
    const speakerDescriptions = speakers.map(s => `${s.name} (personalidade: ${s.personality || 'neutra'})`).join(' e ');
    let prompt = `Você é um roteirista de podcast especialista.
A ideia central do podcast é: "${podcastIdea}".

Sua tarefa é gerar o conteúdo para um segmento do podcast com o título: "${segmentTitle}".
O conteúdo deve ter 3 partes: um roteiro de diálogo, os pontos-chave e um tópico sugerido para discussão ou aprofundamento.
O roteiro deve ser um diálogo conversacional entre: ${speakerDescriptions}. Incorpore as personalidades descritas ao escrever o diálogo de cada um.`;

    if (segmentDescription && segmentDescription.trim() !== '') {
        prompt += `\n\nUse a seguinte descrição como base para o diálogo. Expanda criativamente, não apenas copie:\n---\n${segmentDescription}\n---`;
    }

    if (podcastSources && podcastSources.trim() !== '') {
        prompt += `\n\nLeve em consideração as seguintes fontes para criar o conteúdo:\n---\n${podcastSources}\n---`;
    }

    prompt += `\n\n**REGRAS DO ROTEIRO:**
- Formate o diálogo estritamente como "Nome: Fala.".
- Use os nomes dos apresentadores EXATAMENTE como fornecidos.
- NÃO inclua direções de cena (ex: "[música]", "(rindo)").
- Crie um diálogo que flua naturalmente.
- Para os pontos-chave, formate como uma única string de texto, com cada ponto começando em uma nova linha com um hífen (ex: "- Primeiro ponto\\n- Segundo ponto").`;
    
    return prompt;
}

export async function getSegmentContent(apiKey: string, podcastIdea: string, segmentTitle: string, speakers: Speaker[], podcastSources?: string, segmentDescription?: string): Promise<Partial<Segment>> {
    if (!apiKey) throw new Error("A chave de API do Gemini é necessária.");
    const ai = new GoogleGenAI({ apiKey });
    const proModel = 'gemini-2.5-pro';
    
    const prompt = _buildContentPrompt(podcastIdea, segmentTitle, speakers, podcastSources, segmentDescription);

    try {
        const response = await ai.models.generateContent({
            model: proModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        script: {
                            type: Type.STRING,
                            description: "O roteiro completo do diálogo entre os apresentadores."
                        },
                        keyPoints: {
                            type: Type.STRING,
                            description: "Uma única string contendo de 3 a 5 pontos-chave, cada um em uma nova linha começando com um hífen."
                        },
                        activity: {
                            type: Type.STRING,
                            description: "Uma sugestão de tópico para aprofundamento, pergunta para reflexão ou link para discussão."
                        }
                    }
                }
            }
        });
        
        const parsedResponse = JSON.parse(response.text);

        if (!parsedResponse || typeof parsedResponse.script === 'undefined') {
            throw new Error("A resposta da API não continha um roteiro válido.");
        }

        return {
            content: parsedResponse.script || '',
            keyPoints: parsedResponse.keyPoints || '',
            activitySuggestion: parsedResponse.activity || ''
        };
    } catch (error) {
        console.error("Erro ao gerar conteúdo do segmento:", error);
        throw error;
    }
}

export async function generateMultiSpeakerSpeech(apiKey: string, script: string, speakers: Speaker[]): Promise<string> {
    if (!apiKey) throw new Error("A chave de API do Gemini é necessária.");
    const ai = new GoogleGenAI({ apiKey });
    const flashModel = "gemini-2.5-flash-preview-tts";
    
    if (!script || script.trim() === '') {
        throw new Error('O roteiro está vazio ou contém apenas espaços.');
    }

    const speakersToUse = speakers.slice(0, 2).map(s => ({ ...s, name: s.name.trim() }));

    if (speakersToUse.length < 2) {
        throw new Error('A narração com múltiplos apresentadores requer pelo menos duas vozes.');
    }

    if (speakersToUse.some(s => !s.name)) {
        throw new Error('O nome de um dos apresentadores está vazio. Verifique os nomes e tente novamente.');
    }

    const speakerNames = speakersToUse.map(s => s.name);
    const prompt = `TTS the following conversation between ${speakerNames.join(' and ')}:\n${script}`;
    
    const speakerVoiceConfigs = speakersToUse.map(speaker => ({
        speaker: speaker.name,
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speaker.voiceId }
        }
    }));
    
    try {
        const response = await ai.models.generateContent({
            model: flashModel,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: speakerVoiceConfigs
                    }
                }
            }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!audioData) {
            throw new Error("A API não retornou dados de áudio válidos.");
        }
        
        return audioData;

    } catch (error: any) {
        console.error("Erro ao gerar narração:", error);
        if (error.message && (error.message.includes('speaker_name not found') || error.message.includes('speaker'))) {
             throw new Error("Erro na narração: Verifique se os nomes dos apresentadores no roteiro (ex: 'Nome:') correspondem exatamente aos nomes definidos.");
        }
        throw error;
    }
}
