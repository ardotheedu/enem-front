'use client';

interface ConfirmFinishProps {
  totalQuestions: number;
  answeredQuestions: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmFinish({ 
  totalQuestions, 
  answeredQuestions, 
  onConfirm, 
  onCancel 
}: ConfirmFinishProps) {
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const percentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Finalizar Quiz?
          </h2>
          <p className="text-gray-600">
            Tem certeza que deseja finalizar o quiz agora?
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {answeredQuestions}
              </div>
              <div className="text-sm text-gray-600">Respondidas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {unansweredQuestions}
              </div>
              <div className="text-sm text-gray-600">Não respondidas</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className="text-sm font-semibold text-gray-800">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {unansweredQuestions > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div>
                <p className="text-sm text-yellow-800">
                  Você ainda tem {unansweredQuestions} questão(ões) não respondida(s).
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Questões não respondidas serão consideradas incorretas.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Continuar Quiz
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Finalizar e Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
