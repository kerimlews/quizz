import React, { useState, useMemo, useCallback } from 'react';
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

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortOption(e.target.value as SortOption);
    },
    []
  );

  const sortedResults = useMemo(() => {
    if (!results) return [];
    let sorted = [...results];
    if (sortOption === 'date') {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortOption === 'score') {
      sorted.sort((a, b) => b.score - a.score);
    }
    return sorted;
  }, [results, sortOption]);

  if (isLoading) return <div>Loading history...</div>;

  return (
    <div>
      <h2>Quiz History</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Sort by: </label>
        <select value={sortOption} onChange={handleSortChange}>
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

export default React.memo(QuizHistory);
