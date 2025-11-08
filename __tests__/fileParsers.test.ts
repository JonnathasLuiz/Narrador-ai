import { parseFile } from '../services/fileParsers';

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
  isTrue: (value: boolean, message?: string) => {
    if (value !== true) {
      throw new Error(message || `Esperado true, mas recebido ${value}`);
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
// --- Mocks para ambiente de teste ---
const jest = {
    fn: () => {
        const f: any = (...args: any[]) => {
            f.mock.calls.push(args);
            // Retorna uma implementação mock se existir
            if (f.mock.implementation) {
                return f.mock.implementation(...args);
            }
            // Retorna um valor resolvido mock se existir
            const result = f.mock.results.shift();
            return result ? result.value : undefined;
        };
        f.mock = { calls: [] as any[], results: [] as any[] };
        f.mockImplementation = (impl: (...args: any[]) => any) => {
            f.mock.implementation = impl;
            return f;
        };
        f.mockResolvedValue = (val: any) => {
            f.mock.results.push({ type: 'return', value: Promise.resolve(val) });
            return f;
        };
        f.mockClear = () => { f.mock.calls = []; f.mock.results = []; };
        return f;
    },
};

const expect = (actual: any) => ({
    toHaveBeenCalledTimes: (expected: number) => {
        assert.strictEqual(actual.mock.calls.length, expected, `Esperado que a função fosse chamada ${expected} vezes, mas foi chamada ${actual.mock.calls.length} vezes.`);
    }
});

const beforeAll = (fn: () => void) => fn();
const beforeEach = (fn: () => void) => fn();

// --- Mocks para as bibliotecas globais ---
const setupMocks = () => {
    (globalThis as any).mammoth = {
        extractRawText: jest.fn().mockResolvedValue({ value: 'Conteúdo do DOCX' }),
    };

    (globalThis as any).XLSX = {
        read: jest.fn().mockReturnValue({
            SheetNames: ['Planilha1'],
            Sheets: { 'Planilha1': {} },
        }),
        utils: {
            sheet_to_csv: jest.fn().mockReturnValue('col1,col2\nval1,val2'),
        },
    };

    const mockPdfPage = {
        getTextContent: jest.fn().mockResolvedValue({
            items: [{ str: 'Conteúdo' }, { str: ' ' }, { str: 'do' }, { str: ' ' }, { str: 'PDF' }],
        }),
    };
    const mockPdfDocument = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPdfPage),
    };
    (globalThis as any).pdfjsLib = {
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: jest.fn().mockReturnValue({ promise: Promise.resolve(mockPdfDocument) }),
    };
};

const clearMocks = () => {
    // FIX: Replaced jest.Mock with any to remove namespace errors.
    ((globalThis as any).mammoth.extractRawText as any).mockClear();
    ((globalThis as any).XLSX.read as any).mockClear();
    ((globalThis as any).XLSX.utils.sheet_to_csv as any).mockClear();
    ((globalThis as any).pdfjsLib.getDocument as any).mockClear();
};

// --- Início da Suíte de Testes ---

describe('services/fileParsers.ts', () => {

  beforeAll(setupMocks);
  beforeEach(clearMocks);

  it('deve analisar um arquivo .txt corretamente', async () => {
    const file = new File(['Conteúdo do TXT'], 'teste.txt', { type: 'text/plain' });
    const result = await parseFile(file);
    
    assert.isTrue(result.includes('--- Início do arquivo: teste.txt ---'));
    assert.isTrue(result.includes('Conteúdo do TXT'));
    assert.isTrue(result.includes('--- Fim do arquivo: teste.txt ---'));
  });

  it('deve analisar um arquivo .docx e chamar a biblioteca mammoth', async () => {
    const file = new File([''], 'documento.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const result = await parseFile(file);
    
    expect((globalThis as any).mammoth.extractRawText).toHaveBeenCalledTimes(1);
    assert.isTrue(result.includes('Conteúdo do DOCX'));
  });

  it('deve analisar um arquivo .xlsx e chamar a biblioteca XLSX', async () => {
    const file = new File([''], 'planilha.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const result = await parseFile(file);

    expect((globalThis as any).XLSX.read).toHaveBeenCalledTimes(1);
    expect((globalThis as any).XLSX.utils.sheet_to_csv).toHaveBeenCalledTimes(1);
    assert.isTrue(result.includes('col1,col2\nval1,val2'));
  });

  it('deve analisar um arquivo .pdf e chamar a biblioteca pdf.js', async () => {
    const file = new File([''], 'relatorio.pdf', { type: 'application/pdf' });
    const result = await parseFile(file);

    expect((globalThis as any).pdfjsLib.getDocument).toHaveBeenCalledTimes(1);
    assert.isTrue(result.includes('Conteúdo do PDF'));
  });
  
  it('deve formatar corretamente o conteúdo extraído do PDF', async () => {
    const file = new File([''], 'relatorio.pdf', { type: 'application/pdf' });
    const result = await parseFile(file);
    // Verifica se os itens do textContent foram juntados corretamente
    assert.isTrue(result.includes('Conteúdo do PDF\n'));
  });
  
  it('deve rejeitar um tipo de arquivo não suportado', async () => {
    const file = new File([''], 'imagem.jpg', { type: 'image/jpeg' });
    
    await assert.rejects(
      () => parseFile(file),
      Error,
      'Tipo de arquivo não suportado: .jpg'
    );
  });

});
