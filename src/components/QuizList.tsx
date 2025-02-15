import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchQuizzes, deleteQuizApi } from '../fakeApi';
import { Link } from 'react-router-dom';
import { Quiz } from '../store';

type SortCriteria = 'default' | 'title' | 'questions';

const QuizList: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: quizzes, isLoading } = useQuery<Quiz[]>(
    'quizzes',
    fetchQuizzes
  );
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('default');

  const deleteMutation = useMutation(deleteQuizApi, {
    onSuccess: () => {
      queryClient.invalidateQueries('quizzes');
    },
  });

  if (isLoading) return <div>Loading quizzes...</div>;

  let sortedQuizzes: Quiz[] = quizzes || [];
  if (sortCriteria === 'title') {
    sortedQuizzes = [...sortedQuizzes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortCriteria === 'questions') {
    sortedQuizzes = [...sortedQuizzes].sort(
      (a, b) => a.questions.length - b.questions.length
    );
  }

  return (
    <div>
      <h2>Quiz List</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Sort by: </label>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
        >
          <option value="default">Default</option>
          <option value="title">Title</option>
          <option value="questions">Number of Questions</option>
        </select>
      </div>
      {sortedQuizzes.length === 0 && <p>No quizzes available.</p>}
      <ul>
        {sortedQuizzes.map((quiz) => (
          <li key={quiz.id} style={{ marginBottom: '10px' }}>
            <Link to={`/solve/${quiz.id}`}>{quiz.title}</Link>{' '}
            <Link to={`/edit/${quiz.id}`} style={{ marginLeft: '10px' }}>
              Edit
            </Link>{' '}
            <button
              onClick={() => deleteMutation.mutate(quiz.id)}
              style={{ marginLeft: '10px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
