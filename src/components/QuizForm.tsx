import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { addQuizApi, fetchQuizById, updateQuizApi } from '../fakeApi';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz } from '../store';

interface QuestionForm {
  text: string;
  answers: string[];
  correctAnswerIndex: number;
}

interface QuizFormState {
  title: string;
  questions: QuestionForm[];
}

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<QuizFormState>({
    title: '',
    questions: [],
  });

  const { isLoading } = useQuery(
    ['quiz', id],
    () => fetchQuizById(id!),
    {
      enabled: isEditMode, // Only fetch data in edit mode
      onSuccess: (quiz) => {
        if (!quiz) return;
        setFormState({
          title: quiz.title,
          questions: quiz.questions.map((q) => ({
            text: q.text,
            answers: q.answers,
            correctAnswerIndex: q.correctAnswerIndex,
          })),
        });
      },
    }
  );

  const addQuestion = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: '', answers: ['', ''], correctAnswerIndex: 0 },
      ],
    }));
  }, []);

  const updateQuestion = useCallback(
    (index: number, field: keyof QuestionForm, value: string | number) => {
      setFormState((prev) => ({
        ...prev,
        questions: prev.questions.map((question, i) =>
          i === index
            ? {
                ...question,
                [field]: field === 'correctAnswerIndex' ? Number(value) : value,
              }
            : question
        ),
      }));
    },
    []
  );

  const updateAnswer = useCallback(
    (qIndex: number, aIndex: number, value: string) => {
      setFormState((prev) => ({
        ...prev,
        questions: prev.questions.map((question, i) =>
          i === qIndex
            ? {
                ...question,
                answers: question.answers.map((ans, j) =>
                  j === aIndex ? value : ans
                ),
              }
            : question
        ),
      }));
    },
    []
  );

  const addAnswerField = useCallback((qIndex: number) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === qIndex && question.answers.length < 4
          ? { ...question, answers: [...question.answers, ''] }
          : question
      ),
    }));
  }, []);

  const removeAnswerField = useCallback((qIndex: number, aIndex: number) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === qIndex && question.answers.length > 2
          ? {
              ...question,
              answers: question.answers.filter((_, j) => j !== aIndex),
            }
          : question
      ),
    }));
  }, []);

  // Mutation for adding a quiz with optimistic updates
  const addQuizMutation = useMutation(addQuizApi, {
    onMutate: async (newQuiz) => {
      await queryClient.cancelQueries('quizzes');

      const previousQuizzes = queryClient.getQueryData<Quiz[]>('quizzes');

      queryClient.setQueryData('quizzes', (old: Quiz[] | undefined) => [
        ...(old || []),
        { ...newQuiz, id: 'temp-id' }, // Temporary optimistic quiz
      ]);

      return { previousQuizzes };
    },
    onError: (err, newQuiz, context) => {
      if (context?.previousQuizzes) {
        queryClient.setQueryData('quizzes', context.previousQuizzes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('quizzes');
    },
    onSuccess: () => {
      navigate('/');
    },
  });

  const updateQuizMutation = useMutation(
    ({ id, quiz }: { id: string; quiz: Omit<Quiz, 'id'> }) =>
      updateQuizApi(id, quiz),
    {
      onMutate: async ({ id, quiz }) => {
        await queryClient.cancelQueries(['quiz', id]);

        const previousQuiz = queryClient.getQueryData<Quiz>(['quiz', id]);

        queryClient.setQueryData(['quiz', id], {
          ...previousQuiz,
          ...quiz,
        });

        return { previousQuiz };
      },
      onError: (err, variables, context) => {
        if (context?.previousQuiz) {
          queryClient.setQueryData(['quiz', id], context.previousQuiz);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['quiz', id]);
        queryClient.invalidateQueries('quizzes');
      },
      onSuccess: () => {
        navigate('/');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.title || formState.questions.length === 0) {
      alert('Quiz must have a title and at least one question.');
      return;
    }

    for (let q of formState.questions) {
      if (!q.text || q.answers.some((a) => !a)) {
        alert('Each question must have text and all answers filled.');
        return;
      }
      if (q.answers.length < 2) {
        alert('Each question must have at least 2 answers.');
        return;
      }
    }

    const quizData: Omit<Quiz, 'id'> = {
      title: formState.title,
      questions: formState.questions.map((q) => ({
        id: '', // id will be generated in the store
        text: q.text,
        answers: q.answers,
        correctAnswerIndex: q.correctAnswerIndex,
      })),
    };

    if (isEditMode) {
      updateQuizMutation.mutate({ id, quiz: quizData });
    } else {
      addQuizMutation.mutate(quizData);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{isEditMode ? 'Edit Quiz' : 'Create Quiz'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Quiz Title: </label>
          <input
            type="text"
            value={formState.title}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>
        <div>
          <h3>Questions</h3>
          {formState.questions.map((question, qIndex) => (
            <div
              key={qIndex}
              style={{
                border: '1px solid #ccc',
                marginBottom: '10px',
                padding: '10px',
              }}
            >
              <label>Question Text: </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
              />
              <div>
                <h4>Answers</h4>
                {question.answers.map((answer, aIndex) => (
                  <div key={aIndex}>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        updateAnswer(qIndex, aIndex, e.target.value)
                      }
                    />
                    {question.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswerField(qIndex, aIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {question.answers.length < 4 && (
                  <button type="button" onClick={() => addAnswerField(qIndex)}>
                    Add Answer
                  </button>
                )}
              </div>
              <div>
                <label>Correct Answer Index: </label>
                <input
                  type="number"
                  value={question.correctAnswerIndex}
                  min={0}
                  max={question.answers.length - 1}
                  onChange={(e) =>
                    updateQuestion(qIndex, 'correctAnswerIndex', e.target.value)
                  }
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <button type="submit">
          {isEditMode ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
};

export default React.memo(QuizForm);
