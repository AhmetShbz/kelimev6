import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  XCircle,
  CheckCircle,
  RefreshCw,
  X,
  Volume2,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Bookmark,
  ArrowUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Ses oynatma fonksiyonu
const playAudio = async (text) => {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Ses oynatma hatası:', error);
  }
};

// Kelime Kartı Bileşeni
const WordCard = React.memo(({
  word,
  darkMode,
  categoryIcons,
  category,
  removeFromCategory,
  addToCategory,
  scrollToCard,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      if (!prev) {
        setTimeout(() => scrollToCard(cardRef.current), 50);
      }
      return !prev;
    });
  }, [scrollToCard]);

  // Animasyon varyantları
  const expandVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' },
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      className={`rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-white to-gray-100'
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3
            className={`text-xl sm:text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {word.polish}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => playAudio(word.polish)}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
              aria-label="Kelimeyi Seslendir"
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={toggleExpand}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-200'
              }`}
              aria-label={isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        <p
          className={`mb-3 text-base sm:text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {word.turkish}
        </p>
        <div className="flex justify-between items-center">
          {category === 'Öğrendiğim Kelimeler' ? (
            <ThumbsUp className="text-green-500" size={24} />
          ) : (
            Object.entries(categoryIcons).map(([cat, { icon: Icon, color }]) =>
              cat !== category ? (
                <button
                  key={cat}
                  onClick={() => {
                    removeFromCategory(word, category);
                    addToCategory(word, cat);
                  }}
                  className={`p-2 rounded-full transition-all duration-300 ${color} hover:opacity-80 mr-2`}
                  title={cat}
                  aria-label={`"${word.polish}" kelimesini "${cat}" kategorisine ekle`}
                >
                  <Icon size={20} />
                </button>
              ) : null
            )
          )}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={expandVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`overflow-hidden ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="p-5 grid gap-4">
              {/* Fonetik Bilgisi */}
              {word.phonetic && (
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
              )}
              {/* Örnek Cümle */}
              {word.example && (
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
                      onClick={() => playAudio(word.example)}
                      className={`ml-2 p-1 rounded-full transition-all duration-300 ${
                        darkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-blue-500 text-white hover:bg-blue-400'
                      }`}
                      aria-label="Örnek Cümleyi Seslendir"
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
              )}
              {/* Çeviri */}
              {word.translation && (
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Ana Kategori Popup Bileşeni
const CategoryWordsPopup = ({
  category,
  words,
  onClose,
  addToCategory,
  removeFromCategory,
  darkMode,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const popupRef = useRef(null);

  // Mobil cihaz kontrolü
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Scroll animasyonu
  const scrollToCard = useCallback((cardElement) => {
    if (cardElement && popupRef.current) {
      const cardRect = cardElement.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const scrollTop = popupRef.current.scrollTop;

      const cardTop = cardRect.top - popupRect.top + scrollTop;
      const visibleHeight = popupRect.height;
      const cardHeight = cardRect.height;

      const targetScroll = cardTop - (visibleHeight / 2) + (cardHeight / 2);
      const currentScroll = popupRef.current.scrollTop;
      const scrollDistance = targetScroll - currentScroll;

      // Animasyon ayarları
      const duration = isMobile ? 1500 : 1000;
      const framesPerSecond = 60;
      const totalFrames = (duration / 1000) * framesPerSecond;
      let currentFrame = 0;

      const animate = () => {
        if (currentFrame < totalFrames) {
          currentFrame++;
          const progress = currentFrame / totalFrames;
          const easeProgress = easeInOutCubic(progress);
          const newScrollTop = currentScroll + (scrollDistance * easeProgress);

          popupRef.current.scrollTop = newScrollTop;
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isMobile]);

  // Easing fonksiyonu
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  // Scroll durumunu izle
  useEffect(() => {
    const handleScroll = () => {
      if (popupRef.current.scrollTop > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const currentPopupRef = popupRef.current;
    if (currentPopupRef) {
      currentPopupRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentPopupRef) {
        currentPopupRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Kategori ikonları
  const categoryIcons = {
    'Öğrendiğim Kelimeler': {
      icon: CheckCircle,
      color: darkMode
        ? 'bg-green-700 text-green-200 hover:bg-green-600'
        : 'bg-green-200 text-green-700 hover:bg-green-300',
    },
    'Zorlandığım Kelimeler': {
      icon: XCircle,
      color: darkMode
        ? 'bg-red-700 text-red-200 hover:bg-red-600'
        : 'bg-red-200 text-red-700 hover:bg-red-300',
    },
    'Tekrar Edilecek Kelimeler': {
      icon: RefreshCw,
      color: darkMode
        ? 'bg-yellow-700 text-yellow-200 hover:bg-yellow-600'
        : 'bg-yellow-200 text-yellow-700 hover:bg-yellow-300',
    },
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          darkMode ? 'bg-black bg-opacity-70' : 'bg-gray-800 bg-opacity-50'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-6 rounded-lg shadow-xl max-w-4xl w-full sm:w-11/12 md:w-10/12 lg:w-4/5 h-[90vh] overflow-y-auto mx-2 relative`}
          ref={popupRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Başlık */}
          <div className="flex justify-between items-center mb-6">
            <h3
              className={`text-2xl sm:text-3xl font-bold flex items-center ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {React.createElement(categoryIcons[category]?.icon || BookOpen, {
                className: 'mr-3',
                size: 32,
              })}
              {category}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              aria-label="Popup'ı Kapat"
            >
              <X size={24} />
            </button>
          </div>

          {/* Kelime Kartları */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((word, index) => (
              <WordCard
                key={index}
                word={word}
                darkMode={darkMode}
                categoryIcons={categoryIcons}
                category={category}
                removeFromCategory={removeFromCategory}
                addToCategory={addToCategory}
                scrollToCard={scrollToCard}
              />
            ))}
          </div>

          {/* Yukarı Git Butonu */}
          {isScrolled && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => {
                if (popupRef.current) {
                  const currentScroll = popupRef.current.scrollTop;
                  const duration = isMobile ? 1500 : 1000;
                  const framesPerSecond = 60;
                  const totalFrames = (duration / 1000) * framesPerSecond;
                  let currentFrame = 0;

                  const animate = () => {
                    if (currentFrame < totalFrames) {
                      currentFrame++;
                      const progress = currentFrame / totalFrames;
                      const easeProgress = easeInOutCubic(progress);
                      const newScrollTop = currentScroll * (1 - easeProgress);

                      popupRef.current.scrollTop = newScrollTop;
                      requestAnimationFrame(animate);
                    }
                  };

                  requestAnimationFrame(animate);
                }
              }}
              className={`fixed bottom-5 right-5 p-3 rounded-full shadow-lg transition-colors duration-300 ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
              aria-label="Popup'ın en yukarısına git"
            >
              <ArrowUp size={24} />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default React.memo(CategoryWordsPopup);