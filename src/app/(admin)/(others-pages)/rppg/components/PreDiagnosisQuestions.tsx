// src/app/rppg/components/PreDiagnosisQuestions.tsx

import React from 'react';

const PreDiagnosisQuestions = () => {
  const questions = [
    "Do you have a fever?",
    "Do you have a cough?",
    "Are you experiencing shortness of breath?",
  ];

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
      <h2>Pre-Diagnosis Questions</h2>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>
            {question}
            <button>Yes</button>
            <button>No</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PreDiagnosisQuestions;
