// Importa as bibliotecas de terceiros necessárias para a análise de arquivos.
// Elas são carregadas de seus CDNs, assim como no arquivo index.html.
try {
    importScripts(
        'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs'
    );
    // Configura o worker para a biblioteca PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
} catch (e) {
    console.error("Falha ao importar scripts no worker:", e);
    // Se a importação falhar, informa a thread principal.
    self.postMessage({ success: false, error: 'Não foi possível carregar os scripts de análise.' });
}

// Escuta por mensagens da thread principal (que contêm o arquivo a ser processado).
self.onmessage = async (event) => {
    const file = event.data;
    if (!file || !(file instanceof File)) {
        self.postMessage({ success: false, error: 'Nenhum arquivo válido recebido pelo worker.' });
        return;
    }

    try {
        const content = await getFileContent(file);
        // Envia o conteúdo extraído de volta para a thread principal.
        self.postMessage({ success: true, content });
    } catch (error) {
        // Se ocorrer um erro durante a análise, envia a mensagem de erro de volta.
        self.postMessage({ success: false, error: error.message });
    }
};

// Funções de análise de arquivo (movidas de fileParsers.ts para cá)
// Elas agora são executadas dentro do contexto deste worker.

function readFileAsArrayBuffer(file) {
    return file.arrayBuffer();
}

async function parsePdf(file) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(' ') + '\n';
    }
    return fullText;
}

async function parseDocx(file) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

async function parseSpreadsheet(file) {
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

function parseText(file) {
    return file.text();
}

async function getFileContent(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
        case 'pdf':
            return parsePdf(file);
        case 'docx':
            return parseDocx(file);
        case 'xlsx':
        case 'xls':
        case 'csv':
            return parseSpreadsheet(file);
        case 'txt':
        case 'md':
        case 'text':
            return parseText(file);
        default:
            throw new Error(`Tipo de arquivo não suportado: .${extension}`);
    }
}