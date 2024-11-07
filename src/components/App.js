import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import WordList from './WordList';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Settings from './Settings';
import AuthComponent from './AuthComponent';
import AdminAuth from './AdminAuth';
import AdminPanel from './AdminPanel';
import ProfileMenu from './ProfileMenu';
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from '../utils/helpers';
import { BookOpen, BarChart2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
  // API URL'ini environment variable'dan al veya fallback değeri kullan
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  // State tanımlamaları
  const [words, setWords] = useState(() => {
    const storedWords = getFromLocalStorage('words');
    return storedWords && storedWords.length > 0 ? storedWords : [];
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  const categories = useMemo(() => [
    'Öğrendiğim Kelimeler',
    'Zorlandığım Kelimeler',
    'Tekrar Edilecek Kelimeler',
  ], []);

  const [categorizedWords, setCategorizedWords] = useState(() => {
    const storedCategorizedWords = getFromLocalStorage('categorizedWords') || {};
    const initializedCategorizedWords = {};
    categories.forEach(cat => {
      initializedCategorizedWords[cat] = storedCategorizedWords[cat] || [];
    });
    return initializedCategorizedWords;
  });

  const [userSettings, setUserSettings] = useState(() => ({
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email'),
    profileImage: localStorage.getItem('profileImage'),
    learnedWordsCount: parseInt(localStorage.getItem('learnedWordsCount') || '0'),
    dailyStreak: parseInt(localStorage.getItem('dailyStreak') || '0'),
    isAdmin: localStorage.getItem('isAdmin') === 'true',
  }));

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Dark Mode Toggle Fonksiyonu
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => !prevMode);
  }, []);

  // Çıkış Yapma Fonksiyonu
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    localStorage.clear();
    setUserSettings({
      userId: null,
      username: null,
      email: null,
      profileImage: null,
      learnedWordsCount: 0,
      dailyStreak: 0,
      isAdmin: false,
    });
  }, []);

  // İlk Yüklemede Token Kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setIsAuthenticated(true);
      setIsAdminAuthenticated(isAdmin);
      setUserSettings(prev => ({
        ...prev,
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        profileImage: localStorage.getItem('profileImage'),
        learnedWordsCount: parseInt(localStorage.getItem('learnedWordsCount') || '0'),
        dailyStreak: parseInt(localStorage.getItem('dailyStreak') || '0'),
        isAdmin: isAdmin,
      }));
    }
  }, []);

  // Words Değişikliklerini Local Storage'e Kaydet
  useEffect(() => {
    saveToLocalStorage('words', words);
  }, [words]);

  // Categorized Words Değişikliklerini Local Storage'e Kaydet
  useEffect(() => {
    saveToLocalStorage('categorizedWords', categorizedWords);
  }, [categorizedWords]);

  // User Settings Değişikliklerini Local Storage'e Kaydet
  useEffect(() => {
    Object.entries(userSettings).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value.toString());
      }
    });
  }, [userSettings]);

  // Dark Mode Değişikliklerini Local Storage'e Kaydet ve DOM'u Güncelle
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Kategorilere Kelime Ekleme Fonksiyonu
  const addToCategory = useCallback((word, category) => {
    setCategorizedWords(prev => {
      const updatedCategories = { ...prev };
      // Kelimeyi tüm kategorilerden çıkar
      categories.forEach(cat => {
        if (updatedCategories[cat]) {
          updatedCategories[cat] = updatedCategories[cat].filter(
            w => w.polish !== word.polish
          );
        }
      });
      // Kelimeyi hedef kategoriye ekle
      updatedCategories[category] = [
        ...(updatedCategories[category] || []),
        word,
      ];
      return updatedCategories;
    });
  }, [categories]);

  // Kategoriden Kelime Çıkarma Fonksiyonu
  const removeFromCategory = useCallback((word, category) => {
    setCategorizedWords(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(w => w.polish !== word.polish),
    }));
  }, []);

  // Dosya Yükleme Fonksiyonu
  const handleFileUpload = useCallback(newWords => {
    setWords(newWords);
    saveToLocalStorage('words', newWords);
  }, []);

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="container mx-auto p-4">
          {isAuthenticated && (
            <>
              <header
                className={`flex flex-row justify-between items-center mb-6 ${
                  darkMode ? 'bg-gray-900' : 'bg-white'
                } p-4 md:p-6 rounded-lg shadow-lg transition-colors duration-300 relative`}
              >
                <div className="flex items-center">
                  <h1
                    className={`text-2xl md:text-3xl font-extrabold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    Lehçe Kelime
                  </h1>
                </div>
                <nav className="flex items-center space-x-4">
                  <ProfileMenu
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                    setActiveTab={setActiveTab}
                    handleLogout={handleLogout}
                    userSettings={userSettings}
                  />
                </nav>
              </header>

              <div className="mb-6 flex justify-center space-x-4 flex-wrap">
                {['dashboard', 'words'].map(tab => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-md flex items-center transition-colors duration-300 shadow-md ${
                      activeTab === tab
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'dashboard' && <BarChart2 className="mr-2" size={20} />}
                    {tab === 'words' && <BookOpen className="mr-2" size={20} />}
                    <span className="font-medium">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                  </motion.button>
                ))}
                {userSettings.isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('admin')}
                    className={`px-6 py-3 rounded-md flex items-center transition-colors duration-300 shadow-md ${
                      activeTab === 'admin'
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="mr-2" size={20} />
                    <span className="font-medium">Admin</span>
                  </motion.button>
                )}
              </div>

              <div className="px-4">
                {activeTab === 'dashboard' && (
                  <Dashboard
                    words={words}
                    categorizedWords={categorizedWords}
                    categories={categories}
                    addToCategory={addToCategory}
                    removeFromCategory={removeFromCategory}
                    darkMode={darkMode}
                  />
                )}
                {activeTab === 'words' && (
                  <WordList
                    words={words}
                    categories={categories}
                    categorizedWords={categorizedWords}
                    addToCategory={addToCategory}
                    removeFromCategory={removeFromCategory}
                    darkMode={darkMode}
                  />
                )}
                {activeTab === 'profile' && (
                  <Profile
                    userSettings={userSettings}
                    setUserSettings={setUserSettings}
                    darkMode={darkMode}
                    apiUrl={API_URL}
                  />
                )}
                {activeTab === 'settings' && (
                  <Settings
                    userSettings={userSettings}
                    setUserSettings={setUserSettings}
                    words={words}
                    setWords={handleFileUpload}
                    categories={categories}
                    darkMode={darkMode}
                  />
                )}
                {activeTab === 'admin' && userSettings.isAdmin && (
                  <AdminPanel darkMode={darkMode} apiUrl={API_URL} />
                )}
              </div>
            </>
          )}

          <Routes>
            <Route
              path="/admingiris"
              element={
                isAdminAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <AdminAuth
                    darkMode={darkMode}
                    setIsAuthenticated={setIsAdminAuthenticated}
                    setUserSettings={setUserSettings}
                    apiUrl={API_URL}
                  />
                )
              }
            />
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <AuthComponent
                    darkMode={darkMode}
                    setIsAuthenticated={setIsAuthenticated}
                    setUserSettings={setUserSettings}
                    apiUrl={API_URL}
                  />
                ) : null
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;