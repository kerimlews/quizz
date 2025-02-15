import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import QuizList from './components/QuizList';
import QuizForm from './components/QuizForm';
import QuizSolver from './components/QuizSolver';
import QuizHistory from './components/QuizHistory';

function App() {
  return (
    <div className="App">
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>
          Quiz List
        </Link>
        <Link to="/create" style={{ marginRight: '10px' }}>
          Create Quiz
        </Link>
        <Link to="/history">History</Link>
      </nav>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/create" element={<QuizForm />} />
        <Route path="/edit/:id" element={<QuizForm />} />
        <Route path="/solve/:id" element={<QuizSolver />} />
        <Route path="/history" element={<QuizHistory />} />
      </Routes>
    </div>
  );
}

export default App;
