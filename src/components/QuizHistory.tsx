import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchQuizResultsApi } from '../fakeApi';
import useQuizStore from '../store';
import { QuizResult } from '../store';

type SortOption = 'date' | 'score';

const QuizHistory: React.FC = () => {
  const { data: results, isLoading } = useQuery<QuizResult[]>(
    'results',
    fetchQuizResultsApi
  );
  const quizzes = useQuizStore((state) => state.quizzes);
  const [sortOption, setSortOption] = useState<SortOption>('date');

  if (isLoading) return <div>Loading history...</div>;

  let sortedResults: QuizResult[] = results || [];
  if (sortOption === 'date') {
    sortedResults = [...sortedResults].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else if (sortOption === 'score') {
    sortedResults = [...sortedResults].sort((a, b) => b.score - a.score);
  }

  return (
    <div>
      <h2>Quiz History</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Sort by: </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
        >
          <option value="date">Date</option>
          <option value="score">Score</option>
        </select>
      </div>
      {sortedResults.length === 0 ? (
        <p>No quiz results available.</p>
      ) : (
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Score (%)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result) => {
              const quiz = quizzes.find((q) => q.id === result.quizId);
              return (
                <tr key={result.id}>
                  <td>{quiz ? quiz.title : result.quizId}</td>
                  <td>{result.score.toFixed(2)}</td>
                  <td>{new Date(result.date).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default QuizHistory;
