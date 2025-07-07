'use client';

import { useState, useEffect } from 'react';
import { Question, QuizState, QuizResult } from '@/types/quiz';
import { enemAPI } from '@/services/enemAPI';
import { imagePreloader } from '@/utils/imagePreloader';
import DisciplineSelection from '@/components/DisciplineSelection';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResults from '@/components/QuizResults';
import QuizProgress from '@/components/QuizProgress';
import ConfirmFinish from '@/components/ConfirmFinish';
import Loading from '@/components/Loading';

type QuizPhase = 'selection' | 'loading' | 'quiz' | 'results';

export default function Home() {
  const [phase, setPhase] = useState<QuizPhase>('selection');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    isCompleted: false,
    score: 0,
    totalQuestions: 0,
    selectedDiscipline: null,
    startTime: new Date(),
    endTime: null
  });
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDisciplineSelect = (discipline: string | null) => {
    setSelectedDiscipline(discipline);
  };

  const handleStartQuiz = async () => {
    try {
      setPhase('loading');
      setError(null);
      
      let questions: Question[] = [];
      
      console.log('🚀 Iniciando carregamento do quiz...');
      const startTime = Date.now();
      
      if (selectedDiscipline) {
        // Buscar questões de uma disciplina específica
        questions = await enemAPI.getQuestionsByDiscipline(selectedDiscipline, 45);
      } else {
        // Buscar questões de todas as disciplinas
        questions = await enemAPI.getRandomQuestions(180);
      }

      if (questions.length === 0) {
        throw new Error('Nenhuma questão encontrada. Verifique se a API está funcionando.');
      }

      // Embaralhar as questões
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      
      // Pré-carregar imagens das primeiras 10 questões para melhor UX
      const imagesToPreload: string[] = [];
      shuffledQuestions.slice(0, 10).forEach(question => {
        if (question.context) {
          imagesToPreload.push(...imagePreloader.extractImageUrls(question.context));
        }
        if (question.files) {
          imagesToPreload.push(...question.files);
        }
        if (question.images) {
          imagesToPreload.push(...question.images.context, ...question.images.files, ...question.images.alternatives);
        }
      });
      
      // Pré-carregar imagens em background (não bloquear UI)
      if (imagesToPreload.length > 0) {
        imagePreloader.preloadImages(imagesToPreload).catch(err => {
          console.warn('Alguns problemas no pré-carregamento de imagens:', err);
        });
      }

      const loadTime = Date.now() - startTime;
      console.log(`✅ Quiz carregado em ${loadTime}ms`);

      setQuizState({
        questions: shuffledQuestions,
        currentQuestionIndex: 0,
        userAnswers: {},
        isCompleted: false,
        score: 0,
        totalQuestions: shuffledQuestions.length,
        selectedDiscipline,
        startTime: new Date(),
        endTime: null
      });

      setPhase('quiz');
    } catch (err: any) {
      console.error('Erro ao iniciar quiz:', err);
      setError(err.message || 'Erro ao carregar questões. Verifique se a API está funcionando.');
      setPhase('selection');
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: answer
      }
    }));
  };

  const handleQuestionSelect = (index: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }));
    
    // Pré-carregar imagens das próximas 3 questões
    preloadUpcomingImages(index);
  };

  // Função para pré-carregar imagens das próximas questões
  const preloadUpcomingImages = (currentIndex: number) => {
    const nextQuestions = quizState.questions.slice(currentIndex + 1, currentIndex + 4);
    const imagesToPreload: string[] = [];
    
    nextQuestions.forEach(question => {
      if (question.context) {
        imagesToPreload.push(...imagePreloader.extractImageUrls(question.context));
      }
      if (question.files) {
        imagesToPreload.push(...question.files);
      }
      if (question.images) {
        imagesToPreload.push(...question.images.context, ...question.images.files, ...question.images.alternatives);
      }
    });
    
    if (imagesToPreload.length > 0) {
      imagePreloader.preloadImages(imagesToPreload).catch(() => {
        // Silenciosamente falhar - não é crítico
      });
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      const nextIndex = quizState.currentQuestionIndex + 1;
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));
      
      // Pré-carregar imagens das próximas questões
      preloadUpcomingImages(nextIndex);
    } else {
      // Mostrar modal de confirmação antes de finalizar
      setShowConfirmFinish(true);
    }
  };

  const handleConfirmFinish = () => {
    setShowConfirmFinish(false);
    finishQuiz();
  };

  const handleCancelFinish = () => {
    setShowConfirmFinish(false);
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const finishQuiz = () => {
    const endTime = new Date();
    const timeSpent = endTime.getTime() - quizState.startTime.getTime();
    
    // Calcular resultados
    let correctAnswers = 0;
    const questionResults = quizState.questions.map(question => {
      const userAnswer = quizState.userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAlternative;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        question,
        userAnswer: userAnswer || 'Não respondida',
        isCorrect
      };
    });

    const wrongAnswers = quizState.questions.length - correctAnswers;
    const score = (correctAnswers / quizState.questions.length) * 100;

    const result: QuizResult = {
      totalQuestions: quizState.questions.length,
      correctAnswers,
      wrongAnswers,
      score,
      timeSpent,
      discipline: selectedDiscipline || 'all',
      questions: questionResults
    };

    setQuizResult(result);
    setPhase('results');
  };

  const handleRestart = () => {
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      isCompleted: false,
      score: 0,
      totalQuestions: 0,
      selectedDiscipline: null,
      startTime: new Date(),
      endTime: null
    });
    setQuizResult(null);
    handleStartQuiz();
  };

  const handleBackToMenu = () => {
    setPhase('selection');
    setSelectedDiscipline(null);
    setShowConfirmFinish(false);
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      isCompleted: false,
      score: 0,
      totalQuestions: 0,
      selectedDiscipline: null,
      startTime: new Date(),
      endTime: null
    });
    setQuizResult(null);
    setError(null);
    
    // Limpar cache de imagens para liberar memória
    imagePreloader.clearCache();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBackToMenu}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {phase === 'selection' && (
        <DisciplineSelection
          onDisciplineSelect={handleDisciplineSelect}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {phase === 'loading' && (
        <Loading message="Carregando questões..." />
      )}

      {phase === 'quiz' && quizState.questions.length > 0 && (
        <div>
          <QuizProgress
            questions={quizState.questions}
            currentQuestionIndex={quizState.currentQuestionIndex}
            userAnswers={quizState.userAnswers}
            onQuestionSelect={handleQuestionSelect}
          />
          <QuizQuestion
            question={quizState.questions[quizState.currentQuestionIndex]}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={quizState.userAnswers[quizState.questions[quizState.currentQuestionIndex].id]}
            isAnswered={!!quizState.userAnswers[quizState.questions[quizState.currentQuestionIndex].id]}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentIndex={quizState.currentQuestionIndex}
            totalQuestions={quizState.questions.length}
            canGoNext={true}
            canGoPrevious={quizState.currentQuestionIndex > 0}
            startTime={quizState.startTime}
          />
        </div>
      )}

      {phase === 'results' && quizResult && (
        <QuizResults
          result={quizResult}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Modal de confirmação para finalizar quiz */}
      {showConfirmFinish && (
        <ConfirmFinish
          totalQuestions={quizState.questions.length}
          answeredQuestions={Object.keys(quizState.userAnswers).length}
          onConfirm={handleConfirmFinish}
          onCancel={handleCancelFinish}
        />
      )}
    </div>
  );
}
