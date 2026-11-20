import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
    <h1 className="text-4xl font-bold mb-4">Manage your projects with ease</h1>
    <p className="text-gray-500 mb-8">Boards, tasks and teammates, all in one place.</p>
    <div className="flex gap-4">
      <Link to="/register" className="px-5 py-2 rounded bg-indigo-600 text-white">Get started</Link>
      <Link to="/login" className="px-5 py-2 rounded border">Log in</Link>
    </div>
  </div>
);

export default LandingPage;