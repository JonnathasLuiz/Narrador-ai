// Informa ao TypeScript sobre os objetos globais `gapi` e `google`
declare var gapi: any;
declare var google: any;

let pickerApiLoaded = false;

// Função para carregar os scripts da API do Cliente e do Seletor GAPI.
const loadApis = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!apiKey) {
           return reject(new Error("A chave de API é necessária para o Google Picker."));
        }
        if (pickerApiLoaded) {
            return resolve();
        }
        gapi.load('picker', { 'callback': () => {
            pickerApiLoaded = true;
            resolve();
        }});
    });
};

/**
 * Busca um arquivo do Google Drive usando seu ID.
 * Lida tanto com Google Docs/Sheets nativos quanto com outros tipos de arquivo, como PDFs.
 * @param fileId O ID do arquivo no Google Drive.
 * @param mimeType O tipo MIME do arquivo original no Drive.
 * @param token O token de acesso OAuth2.
 * @returns Uma promessa que resolve com o conteúdo do arquivo como uma Resposta.
 */
const fetchDriveFileContent = async (fileId: string, mimeType: string, token: string): Promise<Response> => {
    let fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    let exportMimeType: string | null = null;
    
    // Verifica se é um Google Doc nativo que precisa ser exportado
    switch (mimeType) {
        case 'application/vnd.google-apps.document':
            exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        case 'application/vnd.google-apps.spreadsheet':
            exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
    }

    if (exportMimeType) {
        fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMimeType}`;
    }
    
    const res = await fetch(fetchUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
        console.error("A busca no Google Drive falhou:", await res.text());
        throw new Error(`Falha ao buscar ou exportar o arquivo (ID: ${fileId}) do Google Drive.`);
    }
    return res;
};


/**
 * Exibe a interface do Google Drive Picker para permitir que o usuário selecione arquivos.
 * @returns Uma promessa que resolve com um array de objetos File.
 */
export const showPicker = (apiKey: string): Promise<File[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            await loadApis(apiKey);
        } catch (e) {
            return reject(e);
        }

        const aistudio = (window as any).aistudio;
        if (!aistudio || !aistudio.auth || !aistudio.auth.getOAuthToken) {
            return reject(new Error('O contexto de autenticação do AI Studio não está disponível.'));
        }

        const token = await aistudio.auth.getOAuthToken();
        if (!token) {
            return reject(new Error('Falha ao obter o token de autenticação.'));
        }

        const pickerCallback = async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
                const filePromises = data.docs.map(async (doc: any): Promise<File> => {
                    const response = await fetchDriveFileContent(doc.id, doc.mimeType, token);
                    const blob = await response.blob();
                    
                    let fileName = doc.name;
                    // Ajusta o nome do arquivo para Google Docs exportados
                    if (doc.mimeType === 'application/vnd.google-apps.document' && !fileName.toLowerCase().endsWith('.docx')) {
                        fileName += '.docx';
                    } else if (doc.mimeType === 'application/vnd.google-apps.spreadsheet' && !fileName.toLowerCase().endsWith('.xlsx')) {
                         fileName += '.xlsx';
                    }

                    return new File([blob], fileName, { type: blob.type });
                });
                
                try {
                    const files = await Promise.all(filePromises);
                    resolve(files);
                } catch (error) {
                    console.error('Erro ao processar arquivos do Drive:', error);
                    reject(error);
                }
            } else if (data.action === google.picker.Action.CANCEL) {
                resolve([]); // Resolve com um array vazio se o usuário cancelar
            }
        };

        const docsView = new google.picker.View(google.picker.ViewId.DOCS);
        docsView.setMimeTypes("application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/pdf,text/plain,text/markdown,text/csv,.docx,.xlsx");
        
        const picker = new google.picker.PickerBuilder()
            .addView(docsView)
            .setOAuthToken(token)
            .setDeveloperKey(apiKey)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    });
};
