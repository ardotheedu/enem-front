import axios from 'axios';
import { Question, Discipline } from '@/types/quiz';

const API_BASE_URL = 'http://localhost:3000';

export const enemAPI = {
  // Buscar disciplinas disponíveis
  async getDisciplines(): Promise<Discipline[]> {
    try {
      console.log('Fazendo requisição para disciplinas...');
      const response = await axios.get(`${API_BASE_URL}/enem/disciplines`, {
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Resposta da API de disciplinas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado ao buscar disciplinas:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar com a API. Verifique se ela está rodando na porta 3000.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Endpoint de disciplinas não encontrado na API.');
      }
      
      throw error;
    }
  },

  // Buscar questões por disciplina
  async getQuestionsByDiscipline(discipline: string, limit: number = 45): Promise<Question[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/enem/questions`, {
        params: {
          discipline,
          limit
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      throw error;
    }
  },

  // Buscar questões aleatórias (para modo completo)
  async getRandomQuestions(limit: number = 180): Promise<Question[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/enem/questions`, {
        params: {
          limit
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar questões aleatórias:', error);
      throw error;
    }
  },

  // Buscar questão específica por ID
  async getQuestionById(id: number): Promise<Question> {
    try {
      const response = await axios.get(`${API_BASE_URL}/enem/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar questão:', error);
      throw error;
    }
  },

  // Buscar anos disponíveis
  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/enem/years`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar anos:', error);
      throw error;
    }
  }
};
