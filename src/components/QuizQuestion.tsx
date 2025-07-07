'use client';

import { useState, useEffect } from 'react';
import { Question, Alternative, QuizState, QuizResult } from '@/types/quiz';
import Timer from './Timer';
import MarkdownRenderer from './MarkdownRenderer';
import QuestionImage from './QuestionImage';
import { imageDuplicationUtils } from '@/utils/imageDuplicationUtils';

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
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <MarkdownRenderer 
              content={question.context}
              className="text-gray-700"
            />
          </div>
        )}

        {/* Exibir apenas imagens que NÃO estão no context markdown */}
        {(() => {
          // Filtrar imagens que já não estão no context para evitar duplicação
          const additionalFiles = imageDuplicationUtils.filterDuplicateImages(
            question.files || [], 
            question.context
          );

          const additionalImageFiles = imageDuplicationUtils.filterDuplicateImages(
            question.images?.files || [], 
            question.context
          ).filter(file => !(question.files || []).includes(file)); // Remove duplicatas com files

          const hasAdditionalImages = additionalFiles.length > 0 || additionalImageFiles.length > 0;

          if (!hasAdditionalImages) return null;

          return (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Imagens adicionais:</h4>
              <div className="grid gap-3">
                {/* Imagens extras do campo files */}
                {additionalFiles.map((file, index) => (
                  <QuestionImage
                    key={`additional-file-${index}`}
                    src={file}
                    alt={`Imagem adicional ${index + 1} da questão`}
                    className="border rounded-lg"
                  />
                ))}
                
                {/* Imagens extras do campo images.files */}
                {additionalImageFiles.map((file, index) => (
                  <QuestionImage
                    key={`additional-images-file-${index}`}
                    src={file}
                    alt={`Imagem adicional ${additionalFiles.length + index + 1} da questão`}
                    className="border rounded-lg"
                  />
                ))}
              </div>
            </div>
          );
        })()}
        
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
              <span className="font-bold text-blue-600 mr-3 mt-1 flex-shrink-0">
                {alternative.letter})
              </span>
              <div className="flex-1">
                <div className="text-gray-800 mb-2">{alternative.text}</div>
                
                {/* Imagem da alternativa se existir */}
                {alternative.filePath && (
                  <div className="mt-2">
                    <QuestionImage
                      src={alternative.filePath}
                      alt={`Imagem da alternativa ${alternative.letter}`}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Imagens das alternativas do campo images.alternatives (apenas se não estão nas alternativas individuais) */}
        {(() => {
          // Coletar todas as imagens já exibidas nas alternativas individuais
          const alternativeImages = question.alternatives
            .map(alt => alt.filePath)
            .filter(Boolean) as string[];

          // Filtrar imagens que não estão duplicadas
          const additionalAlternativeImages = imageDuplicationUtils.filterDuplicateImages(
            question.images?.alternatives || [],
            '' // Não há context markdown aqui
          ).filter(imgSrc => 
            !alternativeImages.some(altImg => 
              imageDuplicationUtils.isSameImage(imgSrc, altImg)
            )
          );

          if (additionalAlternativeImages.length === 0) return null;

          return (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Imagens adicionais das alternativas:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {additionalAlternativeImages.map((imgSrc, index) => (
                  <QuestionImage
                    key={`additional-alt-img-${index}`}
                    src={imgSrc}
                    alt={`Imagem adicional da alternativa ${index + 1}`}
                    className="border rounded"
                  />
                ))}
              </div>
            </div>
          );
        })()}
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
