import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const WordCard = React.memo(({
  word,
  darkMode,
  isExpanded,
  toggleWordExpand,
  playAudio,
  handleCategoryClick,
  categories,
  activeCategory,
  getCategoryButtonStyles,
  categoryIcons,
  difficultyColors
}) => {
  const currentActiveCategory = activeCategory[word.polish];

  const expandVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' }
  };

  return (
    <div
      className={`rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-white to-gray-100'
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3
            className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {word.polish}
          </h3>
          <div className="flex items-center">
            <button
              onClick={() => playAudio(word, 'word')}
              className={`mr-2 p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={() => toggleWordExpand(word.polish)}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        <p
          className={`mb-3 text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {word.turkish}
        </p>
        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              difficultyColors[word.difficulty]
            } transition-colors duration-300`}
          >
            {word.difficulty}
          </span>
          <div className="flex">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(word, category)}
                className={getCategoryButtonStyles(
                  category,
                  currentActiveCategory === category,
                  darkMode
                )}
                title={category}
              >
                {React.createElement(categoryIcons[category].icon, { size: 18 })}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={expandVariants}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className={`overflow-hidden ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="p-5 grid gap-4">
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Bookmark
                    className={`mr-2 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                    size={18}
                  />
                  <span
                    className={`font-semibold ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Fonetik:
                  </span>
                </div>
                <p
                  className={`italic ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {word.phonetic}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Bookmark
                    className={`mr-2 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}
                    size={18}
                  />
                  <span
                    className={`font-semibold ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Örnek Cümle:
                  </span>
                  <button
                    onClick={() => playAudio(word, 'sentence')}
                    className={`ml-2 p-1 rounded-full transition-all duration-300 ${
                      darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-blue-500 text-white hover:bg-blue-400'
                    }`}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <p
                  className={`${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {word.example}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Bookmark
                    className={`mr-2 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}
                    size={18}
                  />
                  <span
                    className={`font-semibold ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Çeviri:
                  </span>
                </div>
                <p
                  className={`${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {word.translation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const WordList = React.memo(({
  words,
  categories,
  addToCategory,
  darkMode
}) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [expandedWords, setExpandedWords] = useState({});
  const [localWords, setLocalWords] = useState(words);
  const [activeCategory, setActiveCategory] = useState({});

  const wordsPerPage = 12;

  useEffect(() => {
    setLocalWords(words);
  }, [words]);

  const playAudio = useCallback(async (word, type) => {
    try {
      const textToSpeak = type === 'word' ? word.polish : word.example;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pl-PL';
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Ses oynatma hatası:', error);
    }
  }, []);

  const filteredWords = useMemo(() => {
    return filter === 'all'
      ? localWords
      : localWords.filter((word) => word.difficulty === filter);
  }, [localWords, filter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredWords.length / wordsPerPage);
  }, [filteredWords.length, wordsPerPage]);

  const currentWords = useMemo(() => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    return filteredWords.slice(startIndex, startIndex + wordsPerPage);
  }, [filteredWords, currentPage, wordsPerPage]);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const toggleWordExpand = useCallback((wordId) => {
    setExpandedWords((prev) => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  }, []);

  const categoryIcons = useMemo(() => ({
    'Öğrendiğim Kelimeler': { icon: CheckCircle, color: 'green' },
    'Zorlandığım Kelimeler': { icon: XCircle, color: 'red' },
    'Tekrar Edilecek Kelimeler': { icon: RefreshCw, color: 'yellow' }
  }), []);

  const handleCategoryClick = useCallback(async (word, category) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/words/category`,
        {
          wordId: word._id,
          categoryName: category
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      addToCategory(word, category);
      setActiveCategory((prev) => ({
        ...prev,
        [word.polish]: category
      }));
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
    }
  }, [API_URL, addToCategory]);

  const difficultyColors = useMemo(() => ({
    Kolay: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    Orta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    Zor: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  }), []);

  const getCategoryButtonStyles = useCallback((category, isActive, isDarkMode) => {
    const baseStyles = 'ml-2 p-2 rounded-full transition-all duration-300';
    const activeStyles = 'ring-2 ring-offset-2 ring-blue-500';

    let colorStyles;
    switch (categoryIcons[category].color) {
      case 'green':
        colorStyles = isDarkMode
          ? `bg-green-700 text-green-200 hover:bg-green-600`
          : `bg-green-200 text-green-700 hover:bg-green-300`;
        break;
      case 'red':
        colorStyles = isDarkMode
          ? `bg-red-700 text-red-200 hover:bg-red-600`
          : `bg-red-200 text-red-700 hover:bg-red-300`;
        break;
      case 'yellow':
        colorStyles = isDarkMode
          ? `bg-yellow-700 text-yellow-200 hover:bg-yellow-600`
          : `bg-yellow-200 text-yellow-700 hover:bg-yellow-300`;
        break;
      default:
        colorStyles = isDarkMode
          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }

    return `${baseStyles} ${colorStyles} ${isActive ? activeStyles : ''}`;
  }, [categoryIcons]);

  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2
          className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          } flex items-center`}
        >
          <BookOpen className="inline-block mr-3" size={32} />
          Kelime Listesi
        </h2>
        <div className="flex items-center">
          <Filter
            className={`mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            size={24}
          />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <option value="all">Tüm Zorluk Seviyeleri</option>
            <option value="Kolay">Kolay</option>
            <option value="Orta">Orta</option>
            <option value="Zor">Zor</option>
          </select>
        </div>
      </div>
      <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {currentWords.map((word) => (
          <WordCard
            key={word.polish}
            word={word}
            darkMode={darkMode}
            isExpanded={expandedWords[word.polish]}
            toggleWordExpand={toggleWordExpand}
            playAudio={playAudio}
            handleCategoryClick={handleCategoryClick}
            categories={categories}
            activeCategory={activeCategory}
            getCategoryButtonStyles={getCategoryButtonStyles}
            categoryIcons={categoryIcons}
            difficultyColors={difficultyColors}
          />
        ))}
      </div>
      <div
        className={`flex justify-between items-center px-6 py-4 border-t ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400'
              : 'bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-300 disabled:text-gray-500'
          } transition-colors duration-300`}
        >
          <ChevronLeft size={18} className="mr-2" />
          Önceki
        </button>

        <div className="flex items-center">
          <span
            className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            } mr-3`}
          >
            Sayfa {currentPage} / {totalPages}
          </span>
          <select
            value={currentPage}
            onChange={(e) => paginate(Number(e.target.value))}
            className={`border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              )
            )}
          </select>
        </div>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400'
              : 'bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-300 disabled:text-gray-500'
          } transition-colors duration-300`}
        >
          Sonraki
          <ChevronRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
});

export default WordList;