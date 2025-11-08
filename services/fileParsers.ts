// Este arquivo agora gerencia a comunicação com o Web Worker.

/**
 * Executa o processo de análise de arquivo em um Web Worker para evitar o bloqueio da thread principal.
 * @param file O arquivo a ser analisado.
 * @returns Uma promessa que resolve com o conteúdo de texto extraído do arquivo.
 */
function runParserWorker(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // Cria uma nova instância do nosso worker.
        const worker = new Worker('/services/parser.worker.js');

        // Lida com mensagens de sucesso do worker.
        worker.onmessage = (event: MessageEvent) => {
            const { success, content, error } = event.data;
            if (success) {
                resolve(content);
            } else {
                reject(new Error(error));
            }
            worker.terminate(); // Limpa o worker após a conclusão.
        };

        // Lida com erros que podem ocorrer no worker.
        worker.onerror = (error: ErrorEvent) => {
            reject(new Error(`Erro no Worker: ${error.message}`));
            worker.terminate(); // Limpa o worker em caso de erro.
        };

        // Envia o arquivo para o worker iniciar o processamento.
        worker.postMessage(file);
    });
}


/**
 * Obtém o conteúdo de texto bruto de um arquivo com base em seu tipo, usando um Web Worker.
 * @param file O arquivo a ser processado.
 * @returns Uma promessa que resolve com o conteúdo de texto bruto do arquivo.
 */
export async function getFileContent(file: File): Promise<string> {
    return runParserWorker(file);
}

/**
 * Analisa um arquivo, extrai seu conteúdo de texto usando o worker e o envolve com metadados.
 * @param file O arquivo a ser processado.
 * @returns Uma promessa que resolve com o texto formatado do arquivo.
 */
export async function parseFile(file: File): Promise<string> {
    const content = await getFileContent(file);
    return `\n\n--- Início do arquivo: ${file.name} ---\n${content}\n--- Fim do arquivo: ${file.name} ---`;
}