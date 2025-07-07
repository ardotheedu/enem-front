export interface Alternative {
  letter: string;
  text: string;
  filePath?: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  title: string;
  index: number;
  year: number;
  context?: string;
  alternativesIntroduction?: string;
  correctAlternative?: string;
  discipline?: {
    label: string;
    value: string;
  };
  language?: {
    label: string;
    value: string;
  };
  alternatives: Alternative[];
  files: string[];
}

export interface Discipline {
  label: string;
  value: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
  selectedDiscipline: string | null;
  startTime: Date;
  endTime: Date | null;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  timeSpent: number;
  discipline: string;
  questions: Array<{
    question: Question;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}
