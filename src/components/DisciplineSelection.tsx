'use client';

import { useState, useEffect } from 'react';
import { Discipline } from '@/types/quiz';
import { enemAPI } from '@/services/enemAPI';
import Loading from './Loading';

interface DisciplineSelectionProps {
  onDisciplineSelect: (discipline: string | null) => void;
  onStartQuiz: () => void;
}

export default function DisciplineSelection({ onDisciplineSelect, onStartQuiz }: DisciplineSelectionProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDisciplines();
    // Pré-carregar dados críticos em background
    enemAPI.preloadCriticalData();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      setError(null);
      const disciplinesData = await enemAPI.getDisciplines();
      setDisciplines(disciplinesData);
    } catch (err: any) {
      console.error('Erro ao carregar disciplinas:', err);
      setError(err.message || 'Erro ao carregar disciplinas');
    } finally {
      setLoading(false);
    }
  };

  const handleDisciplineChange = (discipline: string | null) => {
    setSelectedDiscipline(discipline);
    onDisciplineSelect(discipline);
  };

  const handleStartQuiz = () => {
    onStartQuiz();
  };

  const handleRetry = () => {
    loadDisciplines();
  };

  if (loading) {
    return <Loading message="Carregando disciplinas..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar disciplinas</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ENEM Quiz
          </h1>
          <p className="text-gray-600">
            Escolha uma disciplina específica ou faça o simulado completo
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Modo de Estudo
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Simulado Completo */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                selectedDiscipline === null 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleDisciplineChange(null)}
            >
              <div className="flex items-center mb-3">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedDiscipline === null 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedDiscipline === null && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Simulado Completo
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                180 questões de todas as disciplinas (4 áreas do conhecimento)
              </p>
              <div className="mt-3 text-sm text-blue-600">
                <span className="font-medium">Duração:</span> 5h30min
              </div>
            </div>

            {/* Disciplina Específica */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                selectedDiscipline !== null 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleDisciplineChange(selectedDiscipline || (disciplines[0]?.value || ''))}
            >
              <div className="flex items-center mb-3">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedDiscipline !== null 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedDiscipline !== null && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Disciplina Específica
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                45 questões de uma disciplina específica
              </p>
              <div className="mt-3 text-sm text-blue-600">
                <span className="font-medium">Duração:</span> 1h22min
              </div>
            </div>
          </div>
        </div>

        {/* Discipline Selection */}
        {selectedDiscipline !== null && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Selecione a Disciplina
            </h3>
            
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((discipline) => (
                <button
                  key={discipline.value}
                  onClick={() => handleDisciplineChange(discipline.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedDiscipline === discipline.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{discipline.label}</div>
                  <div className="text-sm opacity-75 mt-1">45 questões</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Instruções
          </h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Você pode navegar entre as questões durante o quiz</li>
            <li>• O tempo é cronometrado automaticamente</li>
            <li>• Suas respostas são salvas automaticamente</li>
            <li>• Você pode revisar e alterar suas respostas antes de finalizar</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {selectedDiscipline === null ? 'Iniciar Simulado Completo' : 'Iniciar Quiz da Disciplina'}
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            {selectedDiscipline === null 
              ? '180 questões • Todas as disciplinas'
              : `45 questões • ${disciplines.find(d => d.value === selectedDiscipline)?.label || 'Disciplina selecionada'}`
            }
          </div>
        </div>
      </div>
    </div>
  );
}
