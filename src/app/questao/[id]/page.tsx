'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Question } from '@/types/quiz';
import { enemAPI } from '@/services/enemAPI';
import QuestionImage from '@/components/QuestionImage';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { imageDuplicationUtils } from '@/utils/imageDuplicationUtils';

export default function QuestionPage() {
  const params = useParams();
  const questionId = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        const questionData = await enemAPI.getQuestionById(parseInt(questionId));
        setQuestion(questionData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar questão');
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questão...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Questão não encontrada</h1>
          <p className="text-gray-600 mb-4">{error || 'Esta questão não existe ou foi removida.'}</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Quiz
          </a>
        </div>
      </div>
    );
  }

  const correctAlternative = question.alternatives.find(alt => alt.isCorrect);
  const additionalFiles = imageDuplicationUtils.filterDuplicateImages(
    question.files || [], 
    question.context
  );

  return (
    <>
      {/* SEO Head será inserido via generateMetadata */}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2 text-gray-500">
              <li><a href="/" className="hover:text-blue-600">Início</a></li>
              <li>/</li>
              <li><a href="/questoes" className="hover:text-blue-600">Questões</a></li>
              <li>/</li>
              <li className="text-gray-800">Questão {question.index}</li>
            </ol>
          </nav>

          {/* Question Card */}
          <article className="bg-white rounded-lg shadow-lg p-8 mb-6">
            {/* Header */}
            <header className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {question.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ENEM {question.year}
                    </span>
                    {question.discipline && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {question.discipline.label}
                      </span>
                    )}
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Questão {question.index}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showAnswer 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showAnswer ? '✅ Gabarito: ' + question.correctAlternative : '👁️ Ver Resposta'}
                  </button>
                </div>
              </div>
            </header>

            {/* Question Content */}
            <section className="mb-6">
              {question.context && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <MarkdownRenderer 
                    content={question.context}
                    className="text-gray-700"
                  />
                </div>
              )}

              {/* Additional Images */}
              {additionalFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Imagens da questão:</h3>
                  <div className="grid gap-4">
                    {additionalFiles.map((file, index) => (
                      <QuestionImage
                        key={`file-${index}`}
                        src={file}
                        alt={`Imagem ${index + 1} da questão ${question.index} - ENEM ${question.year}`}
                        className="border rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {question.alternativesIntroduction && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Enunciado:</h3>
                  <p className="text-gray-700">{question.alternativesIntroduction}</p>
                </div>
              )}
            </section>

            {/* Alternatives */}
            <section className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Alternativas:</h3>
              <div className="space-y-3">
                {question.alternatives.map((alternative) => (
                  <div
                    key={alternative.letter}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      showAnswer && alternative.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : showAnswer && !alternative.isCorrect
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className={`font-bold mr-3 mt-1 flex-shrink-0 ${
                        showAnswer && alternative.isCorrect 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                      }`}>
                        {alternative.letter})
                        {showAnswer && alternative.isCorrect && ' ✅'}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800">{alternative.text}</p>
                        
                        {alternative.filePath && (
                          <div className="mt-3">
                            <QuestionImage
                              src={alternative.filePath}
                              alt={`Imagem da alternativa ${alternative.letter} - Questão ${question.index} ENEM ${question.year}`}
                              className="max-w-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Answer Explanation */}
            {showAnswer && correctAlternative && (
              <section className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  ✅ Resposta Correta: Alternativa {question.correctAlternative}
                </h3>
                <p className="text-green-700">
                  <strong>Explicação:</strong> {correctAlternative.text}
                </p>
              </section>
            )}
          </article>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🏠 Fazer Quiz Completo
            </a>
            <a
              href="/questoes"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              📚 Ver Mais Questões
            </a>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🖨️ Imprimir Questão
            </button>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Question",
            "name": question.title,
            "text": question.alternativesIntroduction || question.context?.substring(0, 200),
            "dateCreated": `${question.year}-01-01`,
            "author": {
              "@type": "Organization",
              "name": "INEP - Instituto Nacional de Estudos e Pesquisas Educacionais"
            },
            "acceptedAnswer": {
              "@type": "Answer",
              "text": correctAlternative?.text,
              "position": question.correctAlternative
            },
            "suggestedAnswer": question.alternatives.map(alt => ({
              "@type": "Answer",
              "text": alt.text,
              "position": alt.letter
            })),
            "about": {
              "@type": "Thing",
              "name": question.discipline?.label || "ENEM"
            },
            "keywords": [
              "ENEM",
              question.year.toString(),
              question.discipline?.label,
              "questão",
              "vestibular",
              "educação"
            ].filter(Boolean).join(", ")
          })
        }}
      />
    </>
  );
}
