// app/components/ExpenseForm.tsx
"use client";

import React, { useState } from 'react';
import { Expense } from '../types'; // Make sure this type includes 'category'

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void; // Now includes category
}

const CATEGORIES = [
  'Food',
  'Groceries',
  'Travel',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Services',
  'Rent/Mortgage',
  'Education',
  'Gifts/Donations',
  'Other'
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Other'); // Default category

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || !date || !description || !category) {
      alert('Please fill in all fields.');
      return;
    }
    onAddExpense({
      amount: parseFloat(amount),
      date,
      description,
      category // Include category in the submitted data
    });
    // Reset form (optional: keep category selection)
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700">
          Amount:
        </label>
        <input
          type="number"
          id="expense-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 15.50"
          step="0.01"
          min="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div>
        <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700">
          Date:
        </label>
        <input
          type="date"
          id="expense-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div>
        <label htmlFor="expense-description" className="block text-sm font-medium text-gray-700">
          Description:
        </label>
        <input
          type="text"
          id="expense-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Coffee with colleagues"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div>
        <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700">
          Category:
        </label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;