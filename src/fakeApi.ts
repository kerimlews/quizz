import { Quiz, QuizResult, useQuizStore } from './store';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  await delay(500);
  return useQuizStore.getState().quizzes;
};

export const fetchQuizById = async (id: string): Promise<Quiz | undefined> => {
  await delay(500);
  return useQuizStore.getState().quizzes.find((q) => q.id === id);
};

export const addQuizApi = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  await delay(500);
  return useQuizStore.getState().addQuiz(quiz);
};

export const updateQuizApi = async (
  id: string,
  quiz: Omit<Quiz, 'id'>
): Promise<Quiz | null> => {
  await delay(500);
  return useQuizStore.getState().updateQuiz(id, quiz);
};

export const deleteQuizApi = async (id: string): Promise<void> => {
  await delay(500);
  useQuizStore.getState().deleteQuiz(id);
};

export const addQuizResultApi = async (
  result: Omit<QuizResult, 'id'>
): Promise<QuizResult> => {
  await delay(500);
  return useQuizStore.getState().addResult(result);
};

export const fetchQuizResultsApi = async (): Promise<QuizResult[]> => {
  await delay(500);
  return useQuizStore.getState().results;
};
