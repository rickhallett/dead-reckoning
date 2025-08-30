import React from 'react';

const SettingsPanel: React.FC = () => {
  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting data to CSV...');
  };

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label>
          Days in Month Basis:
          <select>
            <option value="30">30</option>
            <option value="calendar">Calendar Average</option>
          </select>
        </label>
      </div>
      <button onClick={handleExport}>Export to CSV</button>
    </div>
  );
};

export default SettingsPanel;
