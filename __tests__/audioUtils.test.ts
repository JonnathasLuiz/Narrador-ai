import { createWavBlob } from '../utils/audioUtils';

/**
 * NOTA: Este é um arquivo de teste conceitual. Em um projeto real, este arquivo
 * seria executado por um framework de testes como Jest ou Vitest. A estrutura
 * `describe` e `it` é usada aqui para clareza e para demonstrar como os testes
 * seriam organizados. Para que este arquivo seja autocontido para demonstração,
 * incluímos funções `describe` e `it` muito simples e um `assert` básico.
 */

// --- Mocks simples para describe, it e assert ---
const describe = (description: string, fn: () => void) => {
  // Em um runner real, isso agruparia os testes. Aqui, apenas logamos o grupo.
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
  strictEqual: (actual: any, expected: any) => {
    if (actual !== expected) {
      throw new Error(`Esperado ${expected}, mas recebido ${actual}`);
    }
  },
  instanceOf: (actual: any, expected: any) => {
    if (!(actual instanceof expected)) {
      throw new Error(`Esperado uma instância de ${expected.name}, mas recebido ${actual.constructor.name}`);
    }
  }
};

// --- Início da Suíte de Testes ---

describe('utils/audioUtils.ts', () => {
  
  describe('createWavBlob()', () => {
    
    // Um pequeno e simples base64 válido representando dados PCM brutos.
    // Representa 4 amostras de áudio mono de 16 bits (8 bytes).
    const sampleBase64Pcm = 'AAAAAAIAAAAEAAAA';

    it('deve criar uma instância de Blob', () => {
      const blob = createWavBlob(sampleBase64Pcm);
      assert.instanceOf(blob, Blob);
    });

    it('deve criar um Blob com o tipo MIME correto "audio/wav"', () => {
      const blob = createWavBlob(sampleBase64Pcm);
      assert.strictEqual(blob.type, 'audio/wav');
    });

    it('deve criar um arquivo WAV com um cabeçalho RIFF/WAVE válido', async () => {
      const blob = createWavBlob(sampleBase64Pcm);
      // Lê os primeiros 12 bytes do blob para verificar o cabeçalho.
      const headerBytes = await blob.slice(0, 12).arrayBuffer();
      const view = new DataView(headerBytes);
      
      const riffHeader = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
      assert.strictEqual(riffHeader, 'RIFF');

      const waveHeader = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
      assert.strictEqual(waveHeader, 'WAVE');
    });

    it('deve calcular o tamanho do arquivo corretamente no cabeçalho', async () => {
        // Dados brutos têm 8 bytes. O cabeçalho WAV tem 44 bytes. O tamanho total do blob é 52.
        // O campo de tamanho do arquivo no cabeçalho é o tamanho total - 8. Portanto, 52 - 8 = 44.
        const decodedBytesLength = atob(sampleBase64Pcm).length;
        const expectedFileSizeField = decodedBytesLength + 36; // 8 + 36 = 44
        
        const blob = createWavBlob(sampleBase64Pcm);
        const headerBytes = await blob.slice(0, 8).arrayBuffer();
        const view = new DataView(headerBytes);

        const fileSizeFromHeader = view.getUint32(4, true); // `true` para little-endian
        
        assert.strictEqual(blob.size, decodedBytesLength + 44);
        assert.strictEqual(fileSizeFromHeader, expectedFileSizeField);
    });
  });
});