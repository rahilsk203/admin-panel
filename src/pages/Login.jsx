import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Logo from '../assets/logo.png'; // Add your logo file in the project directory

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://techclinic-api.techclinic-api.workers.dev/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Login failed', { variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-[#181a20] dark:via-[#23263a] dark:to-[#181a20] p-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-[#23263a]/90 rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:-translate-y-1 backdrop-blur-xl border border-blue-100 dark:border-gray-800">
          {/* Logo Section */}
        <div className="flex justify-center mb-6">
            {Logo ? (
              <img
                src={Logo}
                alt="Tech Clinic Admin Logo"
              className="max-w-[150px] h-auto"
              />
            ) : (
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-wide text-center">
                Tech Clinic Admin
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-[#23263a] dark:text-gray-100 transition"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-[#23263a] dark:text-gray-100 transition pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 15.477 7.113 19.5 12 19.5c1.658 0 3.237-.356 4.646-.99m3.374-2.14A10.45 10.45 0 0022.066 12c-1.292-3.477-5.179-7.5-10.066-7.5-1.272 0-2.496.222-3.646.623M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.192.214-2.333.611-3.382m2.076-3.35A10.477 10.477 0 0112 4.5c4.887 0 8.774 4.023 10.066 7.5-.334.902-.83 1.927-1.465 2.963M15.75 15.75A6.75 6.75 0 016.75 8.25m9.5 9.5l-13-13" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
              type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg shadow-md transition bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
              {loading ? 'Logging in...' : 'Login'}
          </button>
          </form>
      </div>
    </div>
  );
}