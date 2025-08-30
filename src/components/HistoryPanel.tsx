import React from 'react';

// Mock data for now
const mockAuditLog = [
  {
    timestamp: '2025-08-30 10:00:00',
    kind: 'income_change',
    human_text: 'Increased Salary by £100/m → +2.5 days',
  },
  {
    timestamp: '2025-08-29 14:30:00',
    kind: 'expense_change',
    human_text: 'Reduced Food by £1/d → +0.51 days',
  },
];

const HistoryPanel: React.FC = () => {
  return (
    <div>
      <h2>History</h2>
      <ul>
        {mockAuditLog.map((entry, index) => (
          <li key={index}>
            <strong>{entry.timestamp}</strong>: {entry.human_text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;
