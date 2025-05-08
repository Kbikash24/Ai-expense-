// app/components/ReceiptUpload.tsx
"use client";

import React, { useState, useRef } from 'react';
import Spinner from './Spinner';
import { ProcessedExpenseData } from '../types'; // Define this type

interface ReceiptUploadProps {
  onExpenseProcessed: (expenseData: ProcessedExpenseData) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onExpenseProcessed }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus(`Selected: ${file.name}`);
      setError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a receipt image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Uploading and processing...');

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Image = reader.result as string;

      try {
        const response = await fetch('/api/process-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64Image }), // Send base64 encoded image
        });

        const result = await response.json();

        if (!response.ok) {
           throw new Error(result.error || 'Processing failed');
        }

        setStatus('Processing complete!');
        onExpenseProcessed(result.data as ProcessedExpenseData); // Pass processed data up

         // Reset after success
         setSelectedFile(null);
         if(fileInputRef.current) fileInputRef.current.value = '';
         setTimeout(() => setStatus(''), 3000); // Clear status message

      } catch (err: any) {
        console.error('Receipt processing error:', err);
        setError(`Error: ${err.message}`);
        setStatus('Processing failed.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error('File reading error:', error);
        setError('Failed to read file.');
        setIsLoading(false);
        setStatus('');
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
         <label htmlFor="receipt-upload" className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Choose Receipt
         </label>
         <input
            id="receipt-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only" // Hide default input, style the label
            disabled={isLoading}
        />
         {selectedFile && !isLoading && (
             <button
                onClick={handleUpload}
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
             >
               Process Receipt
            </button>
         )}
        {isLoading && <Spinner size="sm" />}
      </div>
        <p className="text-sm text-gray-600 min-h-[20px]">{status}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ReceiptUpload;