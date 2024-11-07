import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Book, Award, TrendingUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import CategoryWordsPopup from './CategoryWordsPopup';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const MemoizedChart = React.memo(({ data, darkMode }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={darkMode ? '#374151' : '#E5E7EB'}
      />
      <XAxis
        dataKey="name"
        stroke={darkMode ? '#D1D5DB' : '#4B5563'}
        tick={{ fill: darkMode ? '#D1D5DB' : '#4B5563' }}
      />
      <YAxis
        stroke={darkMode ? '#D1D5DB' : '#4B5563'}
        tick={{ fill: darkMode ? '#D1D5DB' : '#4B5563' }}
      />
      <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

const CustomTooltip = React.memo(({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`p-4 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } rounded shadow-md`}
      >
        <p className="font-bold">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
});

const StatCard = React.memo(({ icon: Icon, title, value, color, onClick, darkMode }) => (
  <motion.div
    whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(0,0,0,0.2)' }}
    className={`${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } p-6 rounded-lg flex items-center cursor-pointer transition-transform duration-300`}
    onClick={onClick}
  >
    <div
      className="p-4 rounded-full mr-4"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Icon color={color} size={36} />
    </div>
    <div>
      <p
        className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {title}
      </p>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  </motion.div>
));

const Dashboard = ({
  words,
  categorizedWords,
  addToCategory,
  removeFromCategory,
  darkMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // İstatistikleri hesapla
  const {
    totalWords,
    learnedWords,
    difficultWords,
    reviewWords,
    data
  } = useMemo(() => {
    const totalWords = words.length;
    const learnedWords = categorizedWords['Öğrendiğim Kelimeler']?.length || 0;
    const difficultWords = categorizedWords['Zorlandığım Kelimeler']?.length || 0;
    const reviewWords = categorizedWords['Tekrar Edilecek Kelimeler']?.length || 0;
    const remainingWords = totalWords - learnedWords - difficultWords - reviewWords;

    const data = [
      { name: 'Öğrendiğim', value: learnedWords, color: '#10B981' },
      { name: 'Zorlandığım', value: difficultWords, color: '#EF4444' },
      { name: 'Tekrar Edilecek', value: reviewWords, color: '#F59E0B' },
      { name: 'Kalan', value: remainingWords, color: '#3B82F6' },
    ];

    return { totalWords, learnedWords, difficultWords, reviewWords, data };
  }, [words, categorizedWords]);

  // Kategori tıklama işleyicisi
  const handleCategoryClick = useCallback(async (word, category) => {
    try {
      const token = localStorage.getItem('token');
      if (category === 'Öğrendiğim Kelimeler') {
        await axios.post(`${API_URL}/words/learned`, {
          wordId: word._id,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      }
      setSelectedCategory(category);
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
    }
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.5 }}
      className={`${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      } rounded-lg shadow-md p-6`}
    >
      <h2
        className={`text-3xl font-bold mb-6 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        Dashboard
      </h2>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Book}
          title="Toplam Kelime"
          value={totalWords}
          color="#3B82F6"
          onClick={() => setSelectedCategory('Tüm Kelimeler')}
          darkMode={darkMode}
        />
        <StatCard
          icon={Award}
          title="Öğrendiğim Kelimeler"
          value={learnedWords}
          color="#10B981"
          onClick={() => setSelectedCategory('Öğrendiğim Kelimeler')}
          darkMode={darkMode}
        />
        <StatCard
          icon={TrendingUp}
          title="Zorlandığım Kelimeler"
          value={difficultWords}
          color="#EF4444"
          onClick={() => setSelectedCategory('Zorlandığım Kelimeler')}
          darkMode={darkMode}
        />
        <StatCard
          icon={RefreshCw}
          title="Tekrar Edilecek Kelimeler"
          value={reviewWords}
          color="#F59E0B"
          onClick={() => setSelectedCategory('Tekrar Edilecek Kelimeler')}
          darkMode={darkMode}
        />
      </div>

      {/* Grafik */}
      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-md p-6 mb-8`}
      >
        <h3
          className={`text-xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Kelime Dağılımı
        </h3>
        <div className="h-80">
          <MemoizedChart data={data} darkMode={darkMode} />
        </div>
      </div>

      {/* Kategori Popup'ı */}
      {selectedCategory && (
        <CategoryWordsPopup
          category={selectedCategory}
          words={selectedCategory === 'Tüm Kelimeler' ? words : categorizedWords[selectedCategory] || []}
          onClose={() => setSelectedCategory(null)}
          addToCategory={addToCategory}
          removeFromCategory={removeFromCategory}
          darkMode={darkMode}
        />
      )}
    </motion.div>
  );
};

export default React.memo(Dashboard);