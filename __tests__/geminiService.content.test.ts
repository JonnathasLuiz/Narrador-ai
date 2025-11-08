import { _buildContentPrompt } from '../services/geminiService';
import type { Speaker } from '../types';

/**
 * NOTA: Este é um arquivo de teste autocontido para demonstração, similar
 * ao `audioUtils.test.ts`. Ele usa funções simples de `describe`, `it`, e `assert`
 * para validar a lógica de construção de prompts sem um framework de teste completo.
 */

// --- Mocks simples para describe, it e assert ---
const describe = (description: string, fn: () => void) => {
  console.group(`\n--- Testando: ${description} ---`);
  fn();
  console.groupEnd();
};

const it = (description: string, fn: () => void) => {
  try {
    fn();
    console.log(`  ✓ OK: ${description}`);
  } catch (error) {
    console.error(`  ✗ FALHA: ${description}`);
    console.error(error);
  }
};

const assert = {
  isTrue: (value: boolean, message?: string) => {
    if (value !== true) {
      throw new Error(message || `Esperado true, mas recebido ${value}`);
    }
  },
  isFalse: (value: boolean, message?: string) => {
    if (value !== false) {
      throw new Error(message || `Esperado false, mas recebido ${value}`);
    }
  },
};

// --- Início da Suíte de Testes ---

describe('services/geminiService.ts', () => {
  
  describe('_buildContentPrompt()', () => {
    
    const sampleCourseIdea = 'Introdução à culinária italiana';
    const sampleLessonTitle = 'O segredo de um bom molho de tomate';
    const sampleSpeakers: Speaker[] = [
        { id: 1, name: 'Chef Ana', voiceId: 'Zephyr' },
        { id: 2, name: 'Marco', voiceId: 'Kore' },
    ];

    it('deve conter a ideia do curso, o título da aula e os nomes dos apresentadores', () => {
        const prompt = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers);
        
        assert.isTrue(prompt.includes(`A ideia central do curso é: "${sampleCourseIdea}"`), 'Deve incluir a ideia do curso');
        assert.isTrue(prompt.includes(`com o título: "${sampleLessonTitle}"`), 'Deve incluir o título da aula');
        assert.isTrue(prompt.includes('um diálogo conversacional entre: Chef Ana e Marco.'), 'Deve incluir os nomes dos apresentadores');
    });

    it('NÃO deve incluir seções de fonte ou descrição se não forem fornecidas', () => {
        const prompt = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers);
        
        assert.isFalse(prompt.includes('Use a seguinte descrição como base'), 'Não deve incluir a seção de descrição');
        assert.isFalse(prompt.includes('Leve em consideração as seguintes fontes'), 'Não deve incluir a seção de fontes');
    });

     it('NÃO deve incluir seções de fonte ou descrição se forem strings vazias ou apenas espaços', () => {
        const promptWithEmptyStrings = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers, '', '');
        assert.isFalse(promptWithEmptyStrings.includes('Use a seguinte descrição como base'), 'Não deve incluir a seção de descrição com string vazia');
        assert.isFalse(promptWithEmptyStrings.includes('Leve em consideração as seguintes fontes'), 'Não deve incluir a seção de fontes com string vazia');

        const promptWithWhitespace = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers, '   ', ' \n ');
        assert.isFalse(promptWithWhitespace.includes('Use a seguinte descrição como base'), 'Não deve incluir a seção de descrição com espaços');
        assert.isFalse(promptWithWhitespace.includes('Leve em consideração as seguintes fontes'), 'Não deve incluir a seção de fontes com espaços');
    });

    it('deve incluir a seção de fontes do curso quando fornecida', () => {
        const sampleSources = 'Artigo sobre tomates San Marzano.';
        const prompt = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers, sampleSources);
        
        assert.isTrue(prompt.includes('Leve em consideração as seguintes fontes para criar o conteúdo:'), 'Deve incluir o cabeçalho das fontes');
        assert.isTrue(prompt.includes(sampleSources), 'Deve incluir o conteúdo das fontes');
        assert.isFalse(prompt.includes('Use a seguinte descrição como base'), 'Não deve incluir a seção de descrição');
    });

    it('deve incluir a seção de descrição da aula quando fornecida', () => {
        const sampleDescription = 'Focar na importância do tempo de cozimento.';
        const prompt = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers, undefined, sampleDescription);
        
        assert.isTrue(prompt.includes('Use a seguinte descrição como base para o diálogo.'), 'Deve incluir o cabeçalho da descrição');
        assert.isTrue(prompt.includes(sampleDescription), 'Deve incluir o conteúdo da descrição');
        assert.isFalse(prompt.includes('Leve em consideração as seguintes fontes'), 'Não deve incluir a seção de fontes');
    });

    it('deve incluir as seções de fontes e descrição quando ambas são fornecidas', () => {
        const sampleSources = 'Artigo sobre tomates.';
        const sampleDescription = 'Focar no cozimento.';
        const prompt = _buildContentPrompt(sampleCourseIdea, sampleLessonTitle, sampleSpeakers, sampleSources, sampleDescription);

        assert.isTrue(prompt.includes('Leve em consideração as seguintes fontes'), 'Deve incluir o cabeçalho das fontes');
        assert.isTrue(prompt.includes(sampleSources), 'Deve incluir o conteúdo das fontes');
        assert.isTrue(prompt.includes('Use a seguinte descrição como base'), 'Deve incluir o cabeçalho da descrição');
        assert.isTrue(prompt.includes(sampleDescription), 'Deve incluir o conteúdo da descrição');
    });

  });
});