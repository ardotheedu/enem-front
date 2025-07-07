'use client';

interface APIErrorProps {
  onRetry: () => void;
  onBackToMenu: () => void;
}

export default function APIError({ onRetry, onBackToMenu }: APIErrorProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-600 mb-6">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">API não disponível</h2>
        
        <p className="text-gray-600 mb-6">
          Não foi possível conectar com a API do ENEM. Verifique se o servidor está rodando em{' '}
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">http://localhost:3000</code>
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Como resolver:</h3>
          <ul className="text-left text-sm text-yellow-700 space-y-1">
            <li>1. Certifique-se de que a API está rodando na porta 3000</li>
            <li>2. Verifique se não há problemas de CORS</li>
            <li>3. Confirme que as rotas estão funcionando</li>
            <li>4. Tente reiniciar o servidor da API</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
}
