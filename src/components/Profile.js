import React, { useState, useEffect } from 'react';
import {
  User, Upload, Edit2, Save, X, Mail, Lock,
  Eye, EyeOff, AlertCircle, Award, Activity,
  Calendar, Book, Target, Star, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = ({ userSettings, setUserSettings, darkMode, setDarkMode }) => {
  const [profileImage, setProfileImage] = useState(userSettings.profileImage || null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(userSettings.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profil tamamlama yüzdesi hesaplama
  const calculateProfileCompletion = () => {
    let total = 0;
    if (userSettings.profileImage) total += 20;
    if (userSettings.email) total += 20;
    if (userSettings.username) total += 20;
    if (userSettings.learnedWordsCount > 0) total += 20;
    if (userSettings.dailyStreak > 0) total += 20;
    return total;
  };

  // Dummy data for activity graph
  const activityData = [
    { name: 'Pzt', words: 12 },
    { name: 'Sal', words: 19 },
    { name: 'Çar', words: 15 },
    { name: 'Per', words: 22 },
    { name: 'Cum', words: 25 },
    { name: 'Cmt', words: 18 },
    { name: 'Paz', words: 20 }
  ];

  const badges = [
    { id: 1, name: 'Başlangıç', icon: Star, earned: true },
    { id: 2, name: '7 Gün Serisi', icon: Calendar, earned: userSettings.dailyStreak >= 7 },
    { id: 3, name: '100 Kelime', icon: Book, earned: userSettings.learnedWordsCount >= 100 },
    { id: 4, name: 'Hedef Aşkını', icon: Target, earned: false }
  ];

  const recentActivities = [
    { id: 1, action: '25 yeni kelime öğrenildi', time: '2 saat önce' },
    { id: 2, action: 'Günlük hedef tamamlandı', time: '5 saat önce' },
    { id: 3, action: 'Yeni rozet kazanıldı', time: '1 gün önce' }
  ];

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Yeni şifreler eşleşmiyor'
      });
      return;
    }

    setIsLoading(true);
    // API çağrısı simülasyonu
    setTimeout(() => {
      setIsLoading(false);
      setNotification({
        type: 'success',
        message: 'Profil başarıyla güncellendi'
      });
      setIsEditing(false);
    }, 1500);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5 }}
      className={`${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } rounded-lg shadow-lg p-6 max-w-4xl mx-auto`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold flex items-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <User className="mr-3" size={28} />
          Profilim
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          {darkMode ? (
            <Sun className="text-yellow-400" size={24} />
          ) : (
            <Moon className="text-gray-600" size={24} />
          )}
        </motion.button>
      </div>

      {/* Notification */}
      <AnimatePresence mode="wait">
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-md flex items-center ${
              notification.type === 'error'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}
          >
            <AlertCircle className="mr-2" size={20} />
            <p>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {['profile', 'statistics', 'badges', 'activities'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 transition-all ${
              activeTab === tab
                ? `border-b-2 border-blue-500 ${darkMode ? 'text-white' : 'text-gray-800'}`
                : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabVariants}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } flex items-center justify-center`}>
                      <User size={64} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-500 transition-colors duration-300"
                    >
                      <Upload size={16} className="text-white" />
                      <input
                        type="file"
                        id="profile-image"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProfileImage(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </motion.div>

                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {userSettings.username}
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {userSettings.email}
                  </p>

                  {/* Profile Completion */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Profil Tamamlama
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {calculateProfileCompletion()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProfileCompletion()}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              {isEditing && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className={`block text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    } mb-1`}>
                      E-posta
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} size={20} />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className={`block text-sm font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    } mb-1`}>
                      Mevcut Şifre
                    </label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} size={20} />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        ) : (
                          <Eye size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Similar structure for new password and confirm password fields */}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Haftalık Aktivite
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <XAxis
                        dataKey="name"
                        stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                      />
                      <YAxis stroke={darkMode ? '#9CA3AF' : '#4B5563'} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="words"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* İstatistik Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Öğrenilen Kelimeler
                      </p>
                      <p className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {userSettings.learnedWordsCount || 0}
                      </p>
                    </div>
                    <Book className="text-blue-500" size={24} />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Günlük Seri
                      </p>
                      <p className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {userSettings.dailyStreak || 0} gün
                      </p>
                    </div>
                    <Activity className="text-green-500" size={24} />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Başarı Rozetleri
                      </p>
                      <p className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {badges.filter(b => b.earned).length}
                      </p>
                    </div>
                    <Award className="text-purple-500" size={24} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg text-center ${
                    darkMode
                      ? badge.earned ? 'bg-gray-800' : 'bg-gray-900'
                      : badge.earned ? 'bg-blue-50' : 'bg-gray-100'
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-full mb-2 ${
                    badge.earned
                      ? 'bg-blue-500'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`}>
                    <badge.icon
                      size={24}
                      className={badge.earned ? 'text-white' : 'text-gray-500'}
                    />
                  </div>
                  <h4 className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {badge.earned ? 'Kazanıldı' : 'Kilitli'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        darkMode ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <Activity size={16} className="text-blue-500" />
                      </div>
                      <p className={darkMode ? 'text-white' : 'text-gray-800'}>
                        {activity.action}
                      </p>
                    </div>
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        {isEditing ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md flex items-center ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Kaydet
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsEditing(false);
                setNewEmail(userSettings.email);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setNotification({ type: '', message: '' });
              }}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md flex items-center ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <X size={18} className="mr-2" />
              İptal
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 rounded-md flex items-center ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors duration-300`}
          >
            <Edit2 size={18} className="mr-2" />
            Düzenle
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;