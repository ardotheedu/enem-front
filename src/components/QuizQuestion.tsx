'use client';

import { useState, useEffect } from 'react';
import { Question, Alternative, QuizState, QuizResult } from '@/types/quiz';
import Timer from './Timer';

interface QuizQuestionProps {
  question: Question;
  onAnswerSelect: (questionId: number, answer: string) => void;
  selectedAnswer?: string;
  isAnswered: boolean;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startTime: Date;
}

export default function QuizQuestion({
  question,
  onAnswerSelect,
  selectedAnswer,
  isAnswered,
  onNext,
  onPrevious,
  currentIndex,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  startTime
}: QuizQuestionProps) {
  const handleAnswerClick = (answer: string) => {
    onAnswerSelect(question.id, answer);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Questão {currentIndex + 1} de {totalQuestions}
            </h2>
            <div className="text-sm text-gray-600">
              {question.discipline?.label} - {question.year}
            </div>
          </div>
          <Timer startTime={startTime} isActive={true} />
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question content */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{question.title}</h3>
        
        {question.context && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{question.context}</p>
          </div>
        )}
        
        {question.alternativesIntroduction && (
          <div className="mb-4">
            <p className="text-gray-800 font-medium">{question.alternativesIntroduction}</p>
          </div>
        )}
      </div>

      {/* Alternatives */}
      <div className="space-y-3 mb-6">
        {question.alternatives.map((alternative: Alternative) => (
          <button
            key={alternative.letter}
            onClick={() => handleAnswerClick(alternative.letter)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
              selectedAnswer === alternative.letter
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 mt-1">
                {alternative.letter})
              </span>
              <span className="text-gray-800">{alternative.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`px-6 py-2 rounded-lg font-medium ${
            canGoPrevious
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Anterior
        </button>

        <div className="text-sm text-gray-600">
          {selectedAnswer ? (
            <span className="text-green-600 font-medium">✓ Respondida</span>
          ) : (
            <span className="text-orange-600">Selecione uma alternativa</span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-6 py-2 rounded-lg font-medium ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentIndex === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
        </button>
      </div>

      {/* Finalizar Quiz Button - aparece quando há questões respondidas */}
      {currentIndex === totalQuestions - 1 && (
        <div className="text-center">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            🎯 Finalizar Quiz e Ver Resultados
          </button>
        </div>
      )}
    </div>
  );
}
