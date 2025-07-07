import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questões ENEM por Ano e Disciplina | Quiz ENEM',
  description: 'Explore todas as questões do ENEM organizadas por ano e disciplina. Pratique com gabarito oficial e explicações detalhadas.',
  keywords: 'ENEM, questões, anos anteriores, disciplinas, gabarito, simulado, vestibular, educação',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Questões ENEM - Todas as Provas por Ano | Quiz ENEM',
    description: 'Acesse milhares de questões do ENEM organizadas por ano e disciplina. Estude com qualidade e melhore sua performance.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function QuestoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
