import type { Metadata } from 'next';
import { enemAPI } from '@/services/enemAPI';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const question = await enemAPI.getQuestionById(parseInt(params.id));
    
    const title = `${question.title} - ENEM ${question.year} | Quiz ENEM`;
    const description = question.alternativesIntroduction 
      ? `${question.alternativesIntroduction.substring(0, 150)}...`
      : `Questão ${question.index} do ENEM ${question.year} - ${question.discipline?.label || 'Todas as áreas'}. Pratique com gabarito e explicação.`;
    
    const keywords = [
      'ENEM',
      question.year.toString(),
      'questão',
      'gabarito',
      'resposta',
      question.discipline?.label,
      'vestibular',
      'educação',
      'prova',
      'simulado'
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'Quiz ENEM' }],
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title,
        description,
        type: 'article',
        locale: 'pt_BR',
        siteName: 'Quiz ENEM',
        publishedTime: `${question.year}-01-01`,
        tags: [
          'ENEM',
          question.year.toString(),
          question.discipline?.label || '',
          'educação'
        ].filter(Boolean),
        images: [
          {
            url: '/og-image-question.jpg',
            width: 1200,
            height: 630,
            alt: `Questão ENEM ${question.year} - ${question.discipline?.label || 'Quiz'}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image-question.jpg'],
        creator: '@QuizENEM',
      },
      alternates: {
        canonical: `/questao/${question.id}`,
      },
      other: {
        'question-id': question.id.toString(),
        'question-year': question.year.toString(),
        'question-discipline': question.discipline?.value || '',
        'question-index': question.index.toString(),
      },
    };
  } catch (error) {
    // Fallback metadata se não conseguir carregar a questão
    return {
      title: 'Questão ENEM | Quiz ENEM',
      description: 'Pratique questões do ENEM com gabarito e explicação. Melhore sua performance no vestibular.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
