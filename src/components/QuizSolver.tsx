import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuizById, addQuizResultApi } from '../fakeApi';
import ConfirmationModal from './ConfirmationModal';

const QUIZ_DURATION_SECONDS = 120; // 2 minutes

const QuizSolver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);

  useEffect(() => {
    if (id) {
      fetchQuizById(id).then((data) => {
        setQuiz(data);
      });
    }
  }, [id]);

  const finishQuiz = useCallback(() => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (q.correctAnswerIndex === userAnswers[i]) {
        correctCount++;
      }
    });
    const percentage = (correctCount / quiz.questions.length) * 100;
    setResult(percentage);
    setShowModal(false);
    if (id) {
      addQuizResultApi({
        quizId: id,
        score: percentage,
        date: new Date(),
      });
    }
  }, [quiz, userAnswers, id]);

  useEffect(() => {
    if (result !== null || !quiz) return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quiz, result, finishQuiz]);

  const handleAnswer = useCallback(
    (index: number) => {
      setUserAnswers((prev) => [...prev, index]);
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowModal(true);
      }
    },
    [currentQuestionIndex, quiz]
  );

  if (!quiz) return <div>Loading quiz...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div>
      <h2>Solving: {quiz.title}</h2>
      <div style={{ marginBottom: '10px' }}>
        Time Left: {Math.floor(timeLeft / 60)}:
        {('0' + (timeLeft % 60)).slice(-2)}
      </div>
      {result === null ? (
        <>
          <div>
            <p>{currentQuestion.text}</p>
            {currentQuestion.answers.map((answer: string, index: number) => (
              <button key={index} onClick={() => handleAnswer(index)}>
                {answer}
              </button>
            ))}
          </div>
          {showModal && (
            <ConfirmationModal
              message="Are you sure you want to finish the quiz?"
              onConfirm={finishQuiz}
              onCancel={() => setShowModal(false)}
            />
          )}
        </>
      ) : (
        <div>
          <h3>Your Score: {result.toFixed(2)}%</h3>
          {result > 60 ? (
            <p>Congratulations, you have successfully finished the quiz!</p>
          ) : (
            <p>Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(QuizSolver);
