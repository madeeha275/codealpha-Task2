// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Page not found.</p>
      <Link to="/" className="mt-6 text-blue-600 hover:underline">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
