import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Question {
  id: string;
  text: string;
  answers: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  date: Date;
}

interface QuizStore {
  quizzes: Quiz[];
  results: QuizResult[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Quiz;
  updateQuiz: (id: string, quiz: Omit<Quiz, 'id'>) => Quiz | null;
  deleteQuiz: (id: string) => void;
  addResult: (result: Omit<QuizResult, 'id'>) => QuizResult;
  getResultByQuizId: (quizId: string) => QuizResult[];
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quizzes: [],
  results: [],
  addQuiz: (quiz) => {
    const newQuiz: Quiz = { id: uuidv4(), ...quiz };
    set((state) => ({ quizzes: [...state.quizzes, newQuiz] }));
    return newQuiz;
  },
  updateQuiz: (id, updatedQuiz) => {
    const quizzes = get().quizzes;
    const index = quizzes.findIndex((q) => q.id === id);
    if (index !== -1) {
      const newQuiz = { id, ...updatedQuiz };
      const newQuizzes = [...quizzes];
      newQuizzes[index] = newQuiz;
      set({ quizzes: newQuizzes });
      return newQuiz;
    }
    return null;
  },
  deleteQuiz: (id) =>
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q.id !== id),
    })),
  addResult: (result) => {
    const newResult: QuizResult = { id: uuidv4(), ...result };
    set((state) => ({ results: [...state.results, newResult] }));
    return newResult;
  },
  getResultByQuizId: (quizId) => {
    return get().results.filter((r) => r.quizId === quizId);
  },
}));

export default useQuizStore;
