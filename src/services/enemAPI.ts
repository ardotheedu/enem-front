import axios from 'axios';
import { Question, Discipline } from '@/types/quiz';

const API_BASE_URL = 'http://localhost:3000';

// Cache para melhorar performance
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Configuração de cache (5 minutos para disciplinas, 10 minutos para questões)
const CACHE_TTL = {
  disciplines: 5 * 60 * 1000, // 5 minutos
  questions: 10 * 60 * 1000,  // 10 minutos
  years: 30 * 60 * 1000       // 30 minutos
};

// Função para verificar e recuperar do cache
const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

// Função para armazenar no cache
const setCache = <T>(key: string, data: T, ttl: number): void => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

// Função para normalizar URLs de imagens
const normalizeImageUrls = (question: Question): Question => {
  const normalizeUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Se for uma URL relativa, construir URL absoluta com a API
    if (url.startsWith('images/')) {
      return `http://localhost:3000/${url}`;
    }
    return url.startsWith('/') ? `http://localhost:3000${url}` : `http://localhost:3000/${url}`;
  };

  const normalizedQuestion = { ...question };

  // Normalizar context se contiver imagens
  if (normalizedQuestion.context) {
    normalizedQuestion.context = normalizedQuestion.context.replace(
      /!\[\]\(([^)]+)\)/g,
      (match, url) => `![](${normalizeUrl(url)})`
    );
  }

  // Normalizar files array
  if (normalizedQuestion.files) {
    normalizedQuestion.files = normalizedQuestion.files.map(normalizeUrl);
  }

  // Normalizar images object se existir
  if (normalizedQuestion.images) {
    if (normalizedQuestion.images.context) {
      normalizedQuestion.images.context = normalizedQuestion.images.context.map(normalizeUrl);
    }
    if (normalizedQuestion.images.files) {
      normalizedQuestion.images.files = normalizedQuestion.images.files.map(normalizeUrl);
    }
    if (normalizedQuestion.images.alternatives) {
      normalizedQuestion.images.alternatives = normalizedQuestion.images.alternatives.map(normalizeUrl);
    }
  }

  // Normalizar filePath nas alternativas
  if (normalizedQuestion.alternatives) {
    normalizedQuestion.alternatives = normalizedQuestion.alternatives.map(alt => ({
      ...alt,
      filePath: alt.filePath ? normalizeUrl(alt.filePath) : alt.filePath
    }));
  }

  return normalizedQuestion;
};

// Função para validar e limpar dados da questão
const validateAndCleanQuestion = (question: any): Question | null => {
  try {
    // Validações básicas
    if (!question.id || !question.title || !question.alternatives || !Array.isArray(question.alternatives)) {
      console.warn('Questão inválida:', question.id);
      return null;
    }

    // Garantir que alternativas tenham a estrutura correta
    const validAlternatives = question.alternatives.filter((alt: any) => 
      alt.letter && alt.text && typeof alt.isCorrect === 'boolean'
    );

    if (validAlternatives.length === 0) {
      console.warn('Questão sem alternativas válidas:', question.id);
      return null;
    }

    const cleanedQuestion: Question = {
      id: question.id,
      title: question.title || '',
      index: question.index || 0,
      year: question.year || new Date().getFullYear(),
      context: question.context || '',
      alternativesIntroduction: question.alternativesIntroduction || '',
      correctAlternative: question.correctAlternative || '',
      discipline: question.discipline || null,
      language: question.language || null,
      alternatives: validAlternatives,
      files: question.files || [],
      images: question.images || { context: [], files: [], alternatives: [] }
    };

    return normalizeImageUrls(cleanedQuestion);
  } catch (error) {
    console.error('Erro ao validar questão:', question.id, error);
    return null;
  }
};

// Função para retry automático
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Não fazer retry para erros 4xx (exceto 429)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Backoff exponencial
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Tentativa ${attempt} falhou, tentando novamente em ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

export const enemAPI = {
  // Buscar disciplinas disponíveis com cache e retry
  async getDisciplines(): Promise<Discipline[]> {
    const cacheKey = 'disciplines';
    const cached = getFromCache<Discipline[]>(cacheKey);
    
    if (cached) {
      console.log('📋 Disciplinas carregadas do cache');
      return cached;
    }

    return withRetry(async () => {
      console.log('🌐 Buscando disciplinas da API...');
      const response = await axios.get(`${API_BASE_URL}/enem/disciplines`, {
        timeout: 15000, // 15 segundos para primeira requisição
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const disciplines = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ ${disciplines.length} disciplinas carregadas`);
      
      // Armazenar no cache
      setCache(cacheKey, disciplines, CACHE_TTL.disciplines);
      
      return disciplines;
    }, 3, 1000);
  },

  // Buscar questões por disciplina com validação e cache
  async getQuestionsByDiscipline(discipline: string, limit: number = 45): Promise<Question[]> {
    const cacheKey = `questions_${discipline}_${limit}`;
    const cached = getFromCache<Question[]>(cacheKey);
    
    if (cached) {
      console.log(`📚 Questões de ${discipline} carregadas do cache`);
      return cached;
    }

    return withRetry(async () => {
      console.log(`🌐 Buscando questões de ${discipline}...`);
      const response = await axios.get(`${API_BASE_URL}/enem/questions`, {
        params: { discipline, limit },
        timeout: 20000, // 20 segundos para questões
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const rawQuestions = response.data?.data || [];
      const validQuestions = rawQuestions
        .map(validateAndCleanQuestion)
        .filter((q: Question | null): q is Question => q !== null);

      if (validQuestions.length === 0) {
        throw new Error(`Nenhuma questão válida encontrada para ${discipline}`);
      }

      console.log(`✅ ${validQuestions.length}/${rawQuestions.length} questões válidas carregadas`);
      
      // Armazenar no cache
      setCache(cacheKey, validQuestions, CACHE_TTL.questions);
      
      return validQuestions;
    }, 3, 1500);
  },

  // Buscar questões aleatórias com validação e cache
  async getRandomQuestions(limit: number = 180): Promise<Question[]> {
    const cacheKey = `random_questions_${limit}`;
    const cached = getFromCache<Question[]>(cacheKey);
    
    // Para questões aleatórias, cache menor (2 minutos) para mais variedade
    if (cached) {
      console.log(`🎲 Questões aleatórias carregadas do cache`);
      return cached;
    }

    return withRetry(async () => {
      console.log(`🌐 Buscando ${limit} questões aleatórias...`);
      const response = await axios.get(`${API_BASE_URL}/enem/questions`, {
        params: { limit },
        timeout: 30000, // 30 segundos para muitas questões
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const rawQuestions = response.data?.data || [];
      const validQuestions = rawQuestions
        .map(validateAndCleanQuestion)
        .filter((q: Question | null): q is Question => q !== null);

      if (validQuestions.length === 0) {
        throw new Error('Nenhuma questão válida encontrada');
      }

      console.log(`✅ ${validQuestions.length}/${rawQuestions.length} questões válidas carregadas`);
      
      // Cache menor para questões aleatórias (2 minutos)
      setCache(cacheKey, validQuestions, 2 * 60 * 1000);
      
      return validQuestions;
    }, 3, 2000);
  },

  // Buscar questão específica por ID com cache
  async getQuestionById(id: number): Promise<Question> {
    const cacheKey = `question_${id}`;
    const cached = getFromCache<Question>(cacheKey);
    
    if (cached) {
      console.log(`📄 Questão ${id} carregada do cache`);
      return cached;
    }

    return withRetry(async () => {
      console.log(`🌐 Buscando questão ${id}...`);
      const response = await axios.get(`${API_BASE_URL}/enem/questions/${id}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const validQuestion = validateAndCleanQuestion(response.data);
      if (!validQuestion) {
        throw new Error(`Questão ${id} é inválida`);
      }

      console.log(`✅ Questão ${id} carregada`);
      
      // Cache longo para questões específicas (30 minutos)
      setCache(cacheKey, validQuestion, 30 * 60 * 1000);
      
      return validQuestion;
    }, 3, 1000);
  },

  // Buscar anos disponíveis com cache
  async getAvailableYears(): Promise<number[]> {
    const cacheKey = 'available_years';
    const cached = getFromCache<number[]>(cacheKey);
    
    if (cached) {
      console.log('📅 Anos disponíveis carregados do cache');
      return cached;
    }

    return withRetry(async () => {
      console.log('🌐 Buscando anos disponíveis...');
      const response = await axios.get(`${API_BASE_URL}/enem/years`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const years = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ ${years.length} anos disponíveis`);
      
      // Cache longo para anos (30 minutos)
      setCache(cacheKey, years, CACHE_TTL.years);
      
      return years;
    }, 3, 1000);
  },

  // Função para limpar cache (útil para development)
  clearCache(): void {
    cache.clear();
    console.log('🧹 Cache limpo');
  },

  // Função para pré-carregar dados críticos
  async preloadCriticalData(): Promise<void> {
    try {
      console.log('🚀 Pré-carregando dados críticos...');
      
      // Carregar disciplinas em paralelo com anos
      const [disciplines, years] = await Promise.all([
        this.getDisciplines().catch(err => {
          console.warn('Falha ao pré-carregar disciplinas:', err.message);
          return [];
        }),
        this.getAvailableYears().catch(err => {
          console.warn('Falha ao pré-carregar anos:', err.message);
          return [];
        })
      ]);
      
      console.log(`🎯 Pré-carregamento concluído: ${disciplines.length} disciplinas, ${years.length} anos`);
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
    }
  }
};
