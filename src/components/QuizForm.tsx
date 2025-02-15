import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
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
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<QuizFormState>({
    title: '',
    questions: [],
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchQuizById(id).then((quiz) => {
        if (quiz) {
          setFormState({
            title: quiz.title,
            questions: quiz.questions.map((q) => ({
              text: q.text,
              answers: q.answers,
              correctAnswerIndex: q.correctAnswerIndex,
            })),
          });
        }
      });
    }
  }, [id, isEditMode]);

  const addQuestion = () => {
    setFormState((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: '', answers: ['', ''], correctAnswerIndex: 0 },
      ],
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formState.questions];
    if (field === 'text') {
      updatedQuestions[index].text = value;
    } else if (field === 'correctAnswerIndex') {
      updatedQuestions[index].correctAnswerIndex = Number(value);
    }
    setFormState({ ...formState, questions: updatedQuestions });
  };

  const updateAnswer = (qIndex: number, aIndex: number, value: string) => {
    const updatedQuestions = [...formState.questions];
    updatedQuestions[qIndex].answers[aIndex] = value;
    setFormState({ ...formState, questions: updatedQuestions });
  };

  const addAnswerField = (qIndex: number) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index === qIndex && question.answers.length < 4) {
          return { ...question, answers: [...question.answers, ''] };
        }
        return question;
      }),
    }));
  };

  const removeAnswerField = (qIndex: number, aIndex: number) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index === qIndex && question.answers.length > 2) {
          return {
            ...question,
            answers: question.answers.filter((_, i) => i !== aIndex),
          };
        }
        return question;
      }),
    }));
  };

  const addQuizMutation = useMutation(addQuizApi, {
    onSuccess: () => {
      queryClient.invalidateQueries('quizzes');
      navigate('/');
    },
  });

  const updateQuizMutation = useMutation(
    ({ id, quiz }: { id: string; quiz: Omit<Quiz, 'id'> }) =>
      updateQuizApi(id, quiz),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('quizzes');
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
        id: '', // will be generated in the store
        text: q.text,
        answers: q.answers,
        correctAnswerIndex: q.correctAnswerIndex,
      })),
    };

    if (isEditMode && id) {
      updateQuizMutation.mutate({ id, quiz: quizData });
    } else {
      addQuizMutation.mutate(quizData);
    }
  };

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
              setFormState({ ...formState, title: e.target.value })
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

export default QuizForm;
