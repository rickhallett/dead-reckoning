import React, { useState, useRef } from 'react';
import { useTransactions } from '../hooks/useTransactions';

interface AddIncomeModalProps {
  onClose: () => void;
}

export function AddIncomeModal({ onClose }: AddIncomeModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { addTransaction } = useTransactions();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount_p = Math.round(parseFloat(amount) * 100);
    if (isNaN(amount_p)) return;

    await addTransaction({ amount_p, note });
    onClose();
  };

  return (
    <dialog ref={dialogRef} open>
      <form onSubmit={handleSubmit}>
        <h2>Add Income/Expense</h2>
        <label>
          Amount:
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Note:
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button type="submit">Add</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </dialog>
  );
}