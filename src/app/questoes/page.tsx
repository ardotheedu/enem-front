'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Question, Discipline } from '@/types/quiz';
import { enemAPI } from '@/services/enemAPI';

interface FilterState {
  discipline: string;
  year: string;
  search: string;
}

export default function QuestionsIndexPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    discipline: '',
    year: '',
    search: ''
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar dados básicos em paralelo
    loadQuestions();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [disciplinesData, yearsData] = await Promise.all([
        enemAPI.getDisciplines(),
        enemAPI.getAvailableYears()
      ]);
      
      setDisciplines(disciplinesData);
      setYears(yearsData.sort((a, b) => b - a)); // Anos em ordem decrescente
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de questões com filtros
      // Em produção, você criaria um endpoint específico para isso
      let questionsData: Question[] = [];
      
      if (filters.discipline) {
        questionsData = await enemAPI.getQuestionsByDiscipline(filters.discipline, 50);
      } else {
        questionsData = await enemAPI.getRandomQuestions(50);
      }

      // Filtrar por ano se especificado
      if (filters.year) {
        questionsData = questionsData.filter(q => q.year.toString() === filters.year);
      }

      // Converter para formato de sumário
      const questionSummaries: QuestionSummary[] = questionsData.map(q => ({
        id: q.id,
        title: q.title,
        index: q.index,
        year: q.year,
        discipline: q.discipline,
        preview: q.alternativesIntroduction?.substring(0, 120) || 
                q.context?.replace(/!\[.*?\]\([^)]+\)/g, '').substring(0, 120) || 
                'Questão sem prévia disponível'
      }));

      setQuestions(questionSummaries);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    
    // Atualizar URL para SEO
    const params = new URLSearchParams();
    if (key === 'year' && value) params.set('ano', value.toString());
    if (key === 'discipline' && value) params.set('disciplina', value.toString());
    if (filters.year && key !== 'year') params.set('ano', filters.year);
    if (filters.discipline && key !== 'discipline') params.set('disciplina', filters.discipline);
    
    window.history.replaceState({}, '', `/questoes?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Questões do ENEM
          </h1>
          <p className="text-gray-600">
            Explore questões organizadas por ano e disciplina. Clique em qualquer questão para ver o gabarito completo.
          </p>
        </header>

        {/* Filters */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os anos</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>
                    ENEM {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Discipline Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disciplina
              </label>
              <select
                value={filters.discipline}
                onChange={(e) => handleFilterChange('discipline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as disciplinas</option>
                {disciplines.map(discipline => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ year: '', discipline: '', page: 1 });
                  window.history.replaceState({}, '', '/questoes');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </section>

        {/* Questions Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Encontradas {questions.length} questões
                  {filters.year && ` do ano ${filters.year}`}
                  {filters.discipline && ` de ${disciplines.find(d => d.value === filters.discipline)?.label}`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions.map((question) => (
                  <article key={question.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <Link href={`/questao/${question.id}`} className="block p-6">
                      <header className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {question.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            ENEM {question.year}
                          </span>
                          {question.discipline && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {question.discipline.label}
                            </span>
                          )}
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            Q{question.index}
                          </span>
                        </div>
                      </header>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {question.preview}...
                      </p>

                      <footer className="flex items-center justify-between">
                        <span className="text-blue-600 text-sm font-medium">
                          Ver questão e gabarito →
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {question.id}
                        </span>
                      </footer>
                    </Link>
                  </article>
                ))}
              </div>

              {questions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Nenhuma questão encontrada
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros para ver mais questões.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Back to Quiz */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🚀 Fazer Quiz Completo
          </Link>
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Questões ENEM",
            "description": "Coleção completa de questões do ENEM organizadas por ano e disciplina",
            "url": "https://quizenem.com/questoes",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": questions.length,
              "itemListElement": questions.slice(0, 10).map((question, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Question",
                  "@id": `/questao/${question.id}`,
                  "name": question.title,
                  "text": question.preview
                }
              }))
            }
          })
        }}
      />
    </div>
  );
}
