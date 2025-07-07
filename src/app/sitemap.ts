import { MetadataRoute } from 'next';
import { enemAPI } from '@/services/enemAPI';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quizenem.com';
  
  try {
    // Carregar todas as questões para o sitemap (em produção, use um endpoint otimizado)
    const allQuestions = await enemAPI.getRandomQuestions(1000); // Limite apropriado
    const disciplines = await enemAPI.getDisciplines();
    const years = await enemAPI.getAvailableYears();
    
    // URLs estáticas
    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/questoes`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];

    // URLs das questões individuais
    const questionUrls: MetadataRoute.Sitemap = allQuestions.map((question) => ({
      url: `${baseUrl}/questao/${question.id}`,
      lastModified: new Date(`${question.year}-01-01`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // URLs de filtros por disciplina
    const disciplineUrls: MetadataRoute.Sitemap = disciplines.map((discipline) => ({
      url: `${baseUrl}/questoes?disciplina=${discipline.value}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // URLs de filtros por ano
    const yearUrls: MetadataRoute.Sitemap = years.map((year) => ({
      url: `${baseUrl}/questoes?ano=${year}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // URLs combinadas (ano + disciplina) - apenas as combinações mais populares
    const combinedUrls: MetadataRoute.Sitemap = [];
    years.slice(0, 5).forEach(year => { // Últimos 5 anos
      disciplines.slice(0, 4).forEach(discipline => { // 4 principais disciplinas
        combinedUrls.push({
          url: `${baseUrl}/questoes?ano=${year}&disciplina=${discipline.value}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        });
      });
    });

    return [...staticUrls, ...questionUrls, ...disciplineUrls, ...yearUrls, ...combinedUrls];
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    
    // Fallback para sitemap básico
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/questoes`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
  }
}
