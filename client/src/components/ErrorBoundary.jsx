// src/components/ErrorBoundary.jsx
import React from 'react';
import { toast } from 'react-hot-toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You could log errorInfo to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    toast.error('Something went wrong. Please try again.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <h2 className="text-xl text-gray-800 dark:text-gray-100">An unexpected error occurred.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
