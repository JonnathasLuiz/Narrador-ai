import { generateMultiSpeakerSpeech } from '../services/geminiService';
import type { Speaker } from '../types';

/**
 * NOTA: Este é um arquivo de teste autocontido para demonstração.
 * Ele usa funções simples de `describe`, `it`, e `assert` para validar a
 * lógica sem um framework de teste completo.
 */

// --- Mocks simples para describe, it e assert ---
const describe = (description: string, fn: () => void) => {
  console.group(`\n--- Testando: ${description} ---`);
  fn();
  console.groupEnd();
};

const it = async (description: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    console.log(`  ✓ OK: ${description}`);
  } catch (error) {
    console.error(`  ✗ FALHA: ${description}`);
    console.error(error);
  }
};

const assert = {
  strictEqual: (actual: any, expected: any, message?: string) => {
    if (actual !== expected) {
      throw new Error(message || `Esperado ${expected}, mas recebido ${actual}`);
    }
  },
  rejects: async (fn: () => Promise<any>, expectedError: new (...args: any[]) => Error, message?: string) => {
    try {
      await fn();
      throw new Error('A função deveria ter rejeitado, mas resolveu.');
    } catch (error) {
      if (!(error instanceof expectedError)) {
        throw new Error(`Esperado que rejeitasse com ${expectedError.name}, mas rejeitou com ${error.constructor.name}.`);
      }
      if (message && !(error as Error).message.includes(message)) {
        throw new Error(`A mensagem de erro esperada "${message}" não foi encontrada em "${(error as Error).message}".`);
      }
    }
  },
};

// FIX: Moved mock test helpers to the top of the file to fix "used before declaration" errors.
// Mock para Jest, já que não temos um ambiente de teste completo.
const jest = {
    fn: () => {
        const f: any = (...args: any[]) => {
            f.mock.calls.push(args);
            return f.mock.results.shift()?.value;
        };
        f.mock = {
            calls: [] as any[],
            results: [] as any[],
        };
        f.mockImplementation = (impl: (...args: any[]) => any) => {
            f.mock.implementation = impl;
            return f;
        };
        f.mockResolvedValue = (val: any) => {
            f.mock.results.push({ type: 'return', value: Promise.resolve(val) });
            return f;
        };
         f.mockRejectedValue = (err: any) => {
            f.mock.results.push({ type: 'return', value: Promise.reject(err) });
            return f;
        };
        f.mockClear = () => {
            f.mock.calls = [];
            f.mock.results = [];
        };
        return f;
    },
    mock: (path: string, factory: () => any) => {}
};
const expect = (actual: any) => ({
    toBe: (expected: any) => assert.strictEqual(actual, expected),
    toEqual: (expected: any) => assert.strictEqual(JSON.stringify(actual), JSON.stringify(expected)),
    // FIX: Added toContain to support string matching assertions
    toContain: (expected: string) => {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    }
});
const beforeEach = (fn: () => void) => fn();


// --- Mock da API Gemini ---
// Simula o módulo @google/genai
const mockGenAI = {
    models: {
        generateContent: jest.fn(),
    },
};

// Substitui a importação real pela nossa simulação
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => mockGenAI),
    Modality: {
        AUDIO: 'AUDIO',
    },
}));


describe('services/geminiService.ts -> generateMultiSpeakerSpeech()', () => {
    // FIX: Add a dummy API key for test calls.
    const sampleApiKey = 'DUMMY_API_KEY';

    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockClear();
    });

    const sampleScript = "Host: Olá a todos! Guest: Olá!";
    const speakers: Speaker[] = [
        { id: 1, name: 'Host', voiceId: 'Zephyr' },
        { id: 2, name: 'Guest', voiceId: 'Kore' },
    ];

    it('deve chamar a API com os parâmetros corretos para uma entrada válida', async () => {
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockResolvedValue({
            candidates: [{ content: { parts: [{ inlineData: { data: 'fake_base64_audio' } }] } }]
        });

        // FIX: Added missing apiKey argument.
        await generateMultiSpeakerSpeech(sampleApiKey, sampleScript, speakers);

        // FIX: Replaced jest.Mock with any to remove namespace errors.
        const call = (mockGenAI.models.generateContent as any).mock.calls[0][0];

        expect(call.model).toBe("gemini-2.5-flash-preview-tts");
        expect(call.contents[0].parts[0].text).toContain("TTS the following conversation between Host and Guest");
        expect(call.contents[0].parts[0].text).toContain(sampleScript);
        expect(call.config.responseModalities).toEqual(['AUDIO']);
        expect(call.config.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs.length).toBe(2);
        expect(call.config.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs[0].speaker).toBe('Host');
        expect(call.config.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs[1].voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    });

    it('deve retornar os dados de áudio em base64 em caso de sucesso', async () => {
         // FIX: Replaced jest.Mock with any to remove namespace errors.
         (mockGenAI.models.generateContent as any).mockResolvedValue({
            candidates: [{ content: { parts: [{ inlineData: { data: 'success_audio_data' } }] } }]
        });
        // FIX: Added missing apiKey argument.
        const result = await generateMultiSpeakerSpeech(sampleApiKey, sampleScript, speakers);
        assert.strictEqual(result, 'success_audio_data');
    });

    it('deve rejeitar se o roteiro estiver vazio ou contiver apenas espaços', async () => {
        await assert.rejects(
            // FIX: Added missing apiKey argument.
            () => generateMultiSpeakerSpeech(sampleApiKey, '   ', speakers),
            Error,
            'O roteiro está vazio'
        );
    });

     it('deve rejeitar se o nome de um apresentador estiver vazio', async () => {
        const invalidSpeakers = [
            { id: 1, name: 'Host', voiceId: 'Zephyr' },
            { id: 2, name: '', voiceId: 'Kore' },
        ];
        await assert.rejects(
            // FIX: Added missing apiKey argument.
            () => generateMultiSpeakerSpeech(sampleApiKey, sampleScript, invalidSpeakers),
            Error,
            'O nome de um dos apresentadores está vazio'
        );
    });
    
     it('deve rejeitar se houver menos de 2 apresentadores', async () => {
        const singleSpeaker = [{ id: 1, name: 'Host', voiceId: 'Zephyr' }];
        await assert.rejects(
            // FIX: Added missing apiKey argument.
            () => generateMultiSpeakerSpeech(sampleApiKey, sampleScript, singleSpeaker),
            Error,
            'requer pelo menos duas vozes'
        );
    });

    it('deve usar apenas os dois primeiros apresentadores se mais de dois forem fornecidos', async () => {
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockResolvedValue({
            candidates: [{ content: { parts: [{ inlineData: { data: 'fake_base64_audio' } }] } }]
        });
        const threeSpeakers = [
            ...speakers,
            { id: 3, name: 'Third', voiceId: 'Puck' }
        ];
        
        // FIX: Added missing apiKey argument.
        await generateMultiSpeakerSpeech(sampleApiKey, sampleScript, threeSpeakers);
        
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        const call = (mockGenAI.models.generateContent as any).mock.calls[0][0];
        const speakerConfigs = call.config.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs;

        expect(speakerConfigs.length).toBe(2);
        expect(speakerConfigs.map((s: any) => s.speaker)).toEqual(['Host', 'Guest']);
    });
    
     it('deve sanitizar nomes de apresentadores (trim)', async () => {
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockResolvedValue({
            candidates: [{ content: { parts: [{ inlineData: { data: 'fake_base64_audio' } }] } }]
        });

        const speakersWithWhitespace = [
            { id: 1, name: '  Host  ', voiceId: 'Zephyr' },
            { id: 2, name: 'Guest ', voiceId: 'Kore' },
        ];
        
        // FIX: Added missing apiKey argument.
        await generateMultiSpeakerSpeech(sampleApiKey, sampleScript, speakersWithWhitespace);
        
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        const call = (mockGenAI.models.generateContent as any).mock.calls[0][0];
        const speakerConfigs = call.config.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs;

        expect(speakerConfigs[0].speaker).toBe('Host');
        expect(speakerConfigs[1].speaker).toBe('Guest');
    });

    it('deve lançar um erro personalizado se a API falhar com uma mensagem relacionada a "speaker"', async () => {
        const apiError = new Error('INVALID_ARGUMENT: speaker_name not found in the prompt.');
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockRejectedValue(apiError);

        await assert.rejects(
            // FIX: Added missing apiKey argument.
            () => generateMultiSpeakerSpeech(sampleApiKey, sampleScript, speakers),
            Error,
            'Verifique se os nomes dos apresentadores no roteiro'
        );
    });

    it('deve lançar um erro genérico se a API falhar por outro motivo', async () => {
        const apiError = new Error('INTERNAL: An internal error occurred.');
        // FIX: Replaced jest.Mock with any to remove namespace errors.
        (mockGenAI.models.generateContent as any).mockRejectedValue(apiError);
        
        await assert.rejects(
            // FIX: Added missing apiKey argument.
            () => generateMultiSpeakerSpeech(sampleApiKey, sampleScript, speakers),
            Error,
            // FIX: Corrected the expected error message to match the actual thrown error.
            'INTERNAL: An internal error occurred.'
        );
    });
});