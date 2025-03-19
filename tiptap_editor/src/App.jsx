import React from 'react';
import VariableEditor from './components/VariableEditor';
import './App.css';

function App() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-teal-400 inline-block text-transparent bg-clip-text">
        TipTap Variable Editor
      </h1>
      <VariableEditor />
    </div>
  );
}

export default App;