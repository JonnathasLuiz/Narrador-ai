import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';

// Informa ao TypeScript sobre as variáveis globais injetadas pelos scripts no index.html
declare var mammoth: any;
declare var XLSX: any;

// Configura o worker para a biblioteca PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

/**
 * Lê um arquivo como um ArrayBuffer.
 * @param file O arquivo a ser lido.
 * @returns Uma promessa que resolve com o ArrayBuffer do arquivo.
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = (e) => reject(new Error(`Erro ao ler o arquivo: ${e.target?.error?.message}`));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Extrai texto de um arquivo PDF.
 * @param file O arquivo PDF.
 * @returns Uma promessa que resolve com o texto extraído.
 */
async function parsePdf(file: File): Promise<string> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
}

/**
 * Extrai texto de um arquivo DOCX.
 * @param file O arquivo DOCX.
 * @returns Uma promessa que resolve com o texto extraído.
 */
async function parseDocx(file: File): Promise<string> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

/**
 * Extrai texto de um arquivo de planilha (XLSX, CSV).
 * @param file O arquivo de planilha.
 * @returns Uma promessa que resolve com o texto extraído em formato CSV.
 */
async function parseSpreadsheet(file: File): Promise<string> {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        if (workbook.SheetNames.length > 1) {
             fullText += `\n--- Planilha: ${sheetName} ---\n`;
        }
        fullText += csv + '\n';
    });
    return fullText;
}

/**
 * Lê o conteúdo de um arquivo de texto simples.
 * @param file O arquivo de texto.
 * @returns Uma promessa que resolve com o conteúdo do arquivo.
 */
function parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error(`Erro ao ler o arquivo de texto: ${e.target?.error?.message}`));
        reader.readAsText(file);
    });
}

/**
 * Analisa um arquivo, extrai seu conteúdo de texto com base na extensão e o envolve com metadados.
 * @param file O arquivo a ser processado.
 * @returns Uma promessa que resolve com o texto formatado do arquivo.
 */
export async function parseFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    let contentPromise: Promise<string>;

    switch (extension) {
        case 'pdf':
            contentPromise = parsePdf(file);
            break;
        case 'docx':
            contentPromise = parseDocx(file);
            break;
        case 'xlsx':
        case 'xls':
        case 'csv':
            contentPromise = parseSpreadsheet(file);
            break;
        case 'txt':
        case 'md':
        case 'text':
            contentPromise = parseText(file);
            break;
        default:
            return Promise.reject(new Error(`Tipo de arquivo não suportado: .${extension}`));
    }

    const content = await contentPromise;
    return `\n\n--- Início do arquivo: ${file.name} ---\n${content}\n--- Fim do arquivo: ${file.name} ---`;
}