import { useState } from 'react';
import './App.css';
import { AddIncomeModal } from './components/AddIncomeModal';
import { PlanBar } from './components/PlanBar';
import { usePlanStore } from './stores/planStore';
import { Category } from './lib/types';

// Mock data - replace with actual data fetching
const mockCategories: Category[] = [
  { category_id: '1', name: 'Rent', amount_p: 120000, frequency: 'monthly', profile_id: '1', optional: 0, step_p: 0, min_p: 0, is_active: 1, version: 1, created_at: '', updated_at: '' },
  { category_id: '2', name: 'Groceries', amount_p: 15000, frequency: 'weekly', profile_id: '1', optional: 0, step_p: 0, min_p: 0, is_active: 1, version: 1, created_at: '', updated_at: '' },
];
const mockBalance = 500000;
const mockDailyBurn = 6000;

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPlanMode, togglePlanMode } = usePlanStore();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dead Reckoning</h1>
        <div>
          <button onClick={() => setIsModalOpen(true)}>Add Income</button>
          <label>
            <input type="checkbox" checked={isPlanMode} onChange={togglePlanMode} />
            Plan Mode
          </label>
        </div>
      </header>
      <main>
        {/* Render your other components here */}
      </main>
      {isModalOpen && <AddIncomeModal onClose={() => setIsModalOpen(false)} />}
      {isPlanMode && <PlanBar liveCategories={mockCategories} liveBalance={mockBalance} liveDailyBurn={mockDailyBurn} />}
    </div>
  );
}

export default App;