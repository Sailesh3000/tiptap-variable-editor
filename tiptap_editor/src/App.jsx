import React from 'react';
import VariableEditor from './components/VariableEditor';
import './App.css';

function App() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">TipTap Variable Editor</h1>
      <VariableEditor />
    </div>
  );
}

export default App;