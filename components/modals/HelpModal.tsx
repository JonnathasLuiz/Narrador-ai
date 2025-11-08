
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-11/12 max-w-3xl text-gray-200 relative border border-gray-700 flex flex-col" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl z-10">
            <h2 className="text-2xl font-bold text-indigo-400">Guia de Uso da Ferramenta</h2>
            <p className="text-sm text-gray-400 mt-1">Siga estes passos para criar seu podcast do zero.</p>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-200 text-3xl" aria-label="Fechar modal">&times;</button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto">
            <details className="bg-gray-900/50 p-4 rounded-lg cursor-pointer transition-all" open>
                <summary className="font-semibold text-lg text-gray-200 list-none flex justify-between items-center">
                    <span><span className="font-bold text-indigo-400">Passo 1:</span> Ideia Central & Fontes</span>
                    <span className="text-xs text-gray-500">[clique para expandir]</span>
                </summary>
                <div className="mt-4 space-y-3 text-gray-300 border-t border-gray-700 pt-3">
                    <p><strong>Ideia Central:</strong> Este é o ponto de partida. Descreva o tema do seu podcast de forma clara e objetiva.</p>
                    <ul className="list-disc list-outside space-y-2 pl-5 text-sm">
                        <li><strong className="text-green-400">Bom:</strong> <span className="italic">"Um podcast para iniciantes sobre a história da computação, cobrindo desde o ábaco até a inteligência artificial."</span></li>
                        <li><strong className="text-yellow-400">Razoável:</strong> <span className="italic">"Podcast de tecnologia."</span> (Muito vago, a IA terá que adivinhar o conteúdo).</li>
                    </ul>
                     <p><strong>Fontes:</strong> Aqui você pode colar textos, artigos, transcrições ou qualquer material que sirva de base para o conteúdo. A IA usará essas informações para criar roteiros mais ricos e precisos.</p>
                     <p><strong>Upload de Arquivos:</strong> Use a área de upload para adicionar conteúdo de arquivos <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">.docx</code>, <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">.pdf</code>, <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">.xlsx</code> ou <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">.txt</code> diretamente para as fontes.</p>
                </div>
            </details>
            
            <details className="bg-gray-900/50 p-4 rounded-lg cursor-pointer transition-all">
                <summary className="font-semibold text-lg text-gray-200 list-none flex justify-between items-center">
                    <span><span className="font-bold text-indigo-400">Passo 2:</span> Apresentadores</span>
                    <span className="text-xs text-gray-500">[clique para expandir]</span>
                </summary>
                <div className="mt-4 space-y-3 text-gray-300 border-t border-gray-700 pt-3">
                    <p>Defina quem irá "falar" no seu podcast. Você pode adicionar quantos apresentadores quiser, mas a narração de áudio funciona melhor com dois.</p>
                     <ul className="list-disc list-outside space-y-2 pl-5 text-sm">
                        <li><strong>Nomes Únicos:</strong> Cada apresentador deve ter um nome diferente para evitar confusão.</li>
                        <li><strong>Correspondência no Roteiro:</strong> A IA usará esses nomes para criar o diálogo. Ao narrar, o sistema de áudio precisa que os nomes no roteiro (ex: <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">"Ana:"</code>) correspondam <span className="font-bold">exatamente</span> aos nomes que você definiu aqui.</li>
                    </ul>
                </div>
            </details>

             <details className="bg-gray-900/50 p-4 rounded-lg cursor-pointer transition-all">
                <summary className="font-semibold text-lg text-gray-200 list-none flex justify-between items-center">
                    <span><span className="font-bold text-indigo-400">Passo 3:</span> Segmentos do Podcast</span>
                    <span className="text-xs text-gray-500">[clique para expandir]</span>
                </summary>
                <div className="mt-4 space-y-3 text-gray-300 border-t border-gray-700 pt-3">
                    <p>Esta é a área principal onde você irá construir e detalhar cada parte do seu podcast.</p>
                     <ul className="list-disc list-outside space-y-3 pl-5 text-sm">
                        <li><strong>Gerar Estrutura:</strong> Com base na sua "Ideia Central", a IA irá sugerir uma lista de segmentos. Você pode editar, remover ou adicionar segmentos manualmente.</li>
                        <li><strong>Gerar Roteiro:</strong> Para cada segmento, clique neste botão para que a IA crie um roteiro, pontos-chave e um tópico de discussão. Ela usará a ideia do podcast, as fontes, o título do segmento e os nomes dos apresentadores.</li>
                         <li><strong>Edição Manual:</strong> Todo o texto gerado é 100% editável. Ajuste os roteiros para que fiquem perfeitos para o seu público.</li>
                        <li><strong>Narrar Segmento:</strong> Este é o passo mágico! Após revisar o roteiro, clique aqui para gerar o áudio. <strong className="text-yellow-400">Importante:</strong> O roteiro deve seguir o formato <code className="bg-gray-700 text-xs px-1 py-0.5 rounded">Nome do Apresentador: Diálogo...</code> para que a narração funcione corretamente.</li>
                    </ul>
                </div>
            </details>

            <details className="bg-gray-900/50 p-4 rounded-lg cursor-pointer transition-all">
                <summary className="font-semibold text-lg text-gray-200 list-none flex justify-between items-center">
                    <span><span className="font-bold text-indigo-400">Passo 4:</span> Exportação</span>
                    <span className="text-xs text-gray-500">[clique para expandir]</span>
                </summary>
                <div className="mt-4 space-y-3 text-gray-300 border-t border-gray-700 pt-3">
                    <p>Após gerar o áudio para os segmentos desejados, você pode finalizar seu projeto.</p>
                     <ul className="list-disc list-outside space-y-2 pl-5 text-sm">
                        <li><strong>Gerar Áudio Completo:</strong> Combina o áudio de todos os segmentos narrados em um único arquivo para você ouvir o podcast de ponta a ponta.</li>
                        <li><strong>Baixar Áudios (.zip):</strong> Cria um arquivo .zip com todos os áudios individuais, nomeados e numerados, prontos para uso.</li>
                        <li><strong>Baixar Roteiro (.txt):</strong> Exporta todo o conteúdo de texto do seu podcast para um único arquivo de texto.</li>
                    </ul>
                </div>
            </details>
        </main>
        
        <footer className="p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800 rounded-b-xl">
             <div className="text-center">
                <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                    Fechar
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;
