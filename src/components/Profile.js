import React, { useState, useEffect } from 'react';
import {
  User,
  Upload,
  Edit2,
  Save,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Profile = ({ userSettings, setUserSettings, darkMode }) => {
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

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setProfileImage(userSettings.profileImage);
    setNewEmail(userSettings.email);
  }, [userSettings]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Yeni şifreler eşleşmiyor'
      });
      return;
    }

    setIsLoading(true);
    setNotification({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/user/profile`,
        {
          userId: userSettings.userId,
          currentPassword,
          newPassword: newPassword || undefined,
          newEmail: newEmail !== userSettings.email ? newEmail : undefined,
          profileImage: profileImage !== userSettings.profileImage ? profileImage : undefined,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUserSettings(prev => ({
        ...prev,
        ...response.data.user
      }));

      localStorage.setItem('email', response.data.user.email);
      localStorage.setItem('profileImage', response.data.user.profileImage || '');

      setNotification({
        type: 'success',
        message: 'Profil başarıyla güncellendi'
      });
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Profil güncellenirken bir hata oluştu'
      });
    } finally {
      setIsLoading(false);
    }
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
      } rounded-lg shadow-md p-6`}
    >
      <h2
        className={`text-2xl font-bold mb-6 flex items-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        <User className="mr-3" size={28} />
        Profilim
      </h2>

      {/* Bildirim Mesajları */}
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

      {/* Profil Resmi ve Temel Bilgiler */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profil"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } flex items-center justify-center`}
            >
              <User
                size={64}
                className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
              />
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
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </label>
          )}
        </div>
        <div>
          <h3
            className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {userSettings.username}
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {userSettings.email}
          </p>
        </div>
      </div>

      {/* Form Alanları */}
      <div className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-1`}
          >
            E-posta
          </label>
          <div className="relative">
            <Mail
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              size={20}
            />
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={!isEditing || isLoading}
              className={`mt-1 block w-full pl-10 pr-4 py-2 rounded-md ${
                darkMode
                  ? 'bg-gray-800 border border-gray-700 text-white'
                  : 'bg-gray-100 border border-gray-300 text-gray-900'
              } ${
                isEditing
                  ? 'focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
                  : ''
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <>
            <div>
              <label
                htmlFor="currentPassword"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Mevcut Şifre
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={20}
                />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`mt-1 block w-full pl-10 pr-10 py-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-800 border border-gray-700 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-900'
                  } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={20}
                />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`mt-1 block w-full pl-10 pr-10 py-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-800 border border-gray-700 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-900'
                  } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={20}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`mt-1 block w-full pl-10 pr-10 py-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-800 border border-gray-700 text-white'
                      : 'bg-gray-100 border border-gray-300 text-gray-900'
                  } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* İstatistikler */}
        <div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            İstatistikler
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Toplam öğrenilen kelime: {userSettings.learnedWordsCount || 0}
          </p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Günlük çalışma serisi: {userSettings.dailyStreak || 0} gün
          </p>
        </div>
      </div>

      {/* Düzenleme ve Kaydetme Butonları */}
      <div className="mt-8 flex justify-end">
        {isEditing ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isLoading}className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                setProfileImage(userSettings.profileImage);
                setNotification({ type: '', message: '' });
              }}
              disabled={isLoading}
              className={`ml-3 px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
              darkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
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