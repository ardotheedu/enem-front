'use client';

import { QuizResult } from '@/types/quiz';

interface QuizResultsProps {
  result: QuizResult;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export default function QuizResults({ result, onRestart, onBackToMenu }: QuizResultsProps) {
  const percentage = (result.correctAnswers / result.totalQuestions) * 100;
  const timeInMinutes = Math.floor(result.timeSpent / 60000);
  const timeInSeconds = Math.floor((result.timeSpent % 60000) / 1000);

  const getDisciplineName = (discipline: string) => {
    const disciplineMap: Record<string, string> = {
      'matematica': 'Matemática e suas Tecnologias',
      'ciencias-natureza': 'Ciências da Natureza e suas Tecnologias',
      'ciencias-humanas': 'Ciências Humanas e suas Tecnologias',
      'linguagens': 'Linguagens, Códigos e suas Tecnologias'
    };
    return disciplineMap[discipline] || discipline;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 80) return { message: "Excelente!", color: "text-green-600" };
    if (percentage >= 60) return { message: "Bom trabalho!", color: "text-blue-600" };
    if (percentage >= 40) return { message: "Pode melhorar!", color: "text-yellow-600" };
    return { message: "Continue estudando!", color: "text-red-600" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header com resultado principal */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Finalizado!</h1>
          <p className={`text-2xl font-semibold ${performance.color}`}>
            {performance.message}
          </p>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {result.correctAnswers}
            </div>
            <div className="text-sm text-gray-600">Questões Corretas</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {result.wrongAnswers}
            </div>
            <div className="text-sm text-gray-600">Questões Erradas</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Aproveitamento</div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Tempo Total</h3>
            <p className="text-lg text-gray-600">
              {timeInMinutes}min {timeInSeconds}s
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Disciplina</h3>
            <p className="text-lg text-gray-600">
              {result.discipline === 'all' ? 'Todas as Disciplinas' : getDisciplineName(result.discipline)}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Aproveitamento</span>
            <span className="text-sm font-semibold text-gray-800">
              {result.correctAnswers}/{result.totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                percentage >= 60 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Refazer Quiz
          </button>
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Voltar ao Menu
          </button>
        </div>
      </div>

      {/* Revisão das questões */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Revisão das Questões</h2>
        
        <div className="space-y-4">
          {result.questions.map((item, index) => (
            <div
              key={item.question.id}
              className={`p-4 rounded-lg border-l-4 ${
                item.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">
                  Questão {index + 1}: {item.question.title}
                </h3>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  item.isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.isCorrect ? 'Correto' : 'Incorreto'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Sua resposta:</span> {item.userAnswer}
                {!item.isCorrect && (
                  <>
                    <br />
                    <span className="font-medium">Resposta correta:</span> {item.question.correctAlternative}
                  </>
                )}
              </div>
              
              {item.question.discipline && (
                <div className="text-xs text-gray-500">
                  {item.question.discipline.label} - {item.question.year}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
