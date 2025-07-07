'use client';

import { Question } from '@/types/quiz';

interface QuizProgressProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  onQuestionSelect: (index: number) => void;
}

export default function QuizProgress({ 
  questions, 
  currentQuestionIndex, 
  userAnswers, 
  onQuestionSelect 
}: QuizProgressProps) {
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Progresso do Quiz</h3>
        <div className="text-sm text-gray-600">
          {answeredCount}/{totalQuestions} respondidas
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 mb-4">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onQuestionSelect(index)}
            className={`w-8 h-8 rounded text-xs font-bold transition-all duration-200 ${
              index === currentQuestionIndex
                ? 'bg-blue-600 text-white shadow-lg scale-110'
                : userAnswers[question.id]
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-gray-600">Atual</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-600">Respondida</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
            <span className="text-gray-600">Não respondida</span>
          </div>
        </div>
        <div className="text-gray-600">
          {Math.round((answeredCount / totalQuestions) * 100)}% concluído
        </div>
      </div>
    </div>
  );
}

export default QuizProgress;
