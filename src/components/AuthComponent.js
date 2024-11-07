import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import axios from 'axios';

const AuthComponent = ({ darkMode, setIsAuthenticated, setUserSettings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await axios.get(
          `${API_URL}/login`,
          { loginIdentifier, password },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setNotification({
          type: 'success',
          message: 'Giriş başarılı! Yönlendiriliyorsunuz...',
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('profileImage', response.data.profileImage || '');
        setUserSettings({
          userId: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          profileImage: response.data.profileImage || '',
          learnedWordsCount: response.data.learnedWordsCount,
          dailyStreak: response.data.dailyStreak,
          isAdmin: response.data.isAdmin,
        });
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 1500);
      } else {
        await axios.get(
          `${API_URL}/register`,
          {
            username,
            email,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setNotification({
          type: 'success',
          message: 'Kayıt başarılı! Giriş yapılıyor...',
        });
        setTimeout(async () => {
          const loginResponse = await axios.post(
            `${API_URL}/login`,
            { loginIdentifier: email, password },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('userId', loginResponse.data.userId);
          localStorage.setItem('username', loginResponse.data.username);
          localStorage.setItem('email', loginResponse.data.email);
          localStorage.setItem('profileImage', loginResponse.data.profileImage || '');
          setUserSettings({
            userId: loginResponse.data.userId,
            username: loginResponse.data.username,
            email: loginResponse.data.email,
            profileImage: loginResponse.data.profileImage || '',
            learnedWordsCount: loginResponse.data.learnedWordsCount,
            dailyStreak: loginResponse.data.dailyStreak,
            isAdmin: loginResponse.data.isAdmin,
          });
          setIsAuthenticated(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Bir hata oluştu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setLoginIdentifier('');
    setEmail('');
    setPassword('');
    setUsername('');
    setNotification({ type: '', message: '' });
    setIsLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex flex-col md:flex-row w-full max-w-4xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-xl overflow-hidden`}
      >
        {/* Görsel Bölümü */}
        <div
          className={`hidden md:flex w-full md:w-1/2 items-center justify-center p-8 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          <img
            src="/api/placeholder/400/300"
            alt="Giriş Görseli"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Form Bölümü */}
        <div className="w-full md:w-1/2 p-8">
          <h2
            className={`text-3xl font-bold text-center mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>
          <AnimatePresence mode="wait">
            {notification.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-md flex items-center ${
                  notification.type === 'error'
                    ? 'bg-red-100 border border-red-400 text-red-700'
                    : 'bg-green-100 border border-green-400 text-green-700'
                }`}
              >
                {notification.type === 'error' ? (
                  <XCircle className="mr-2" size={20} />
                ) : (
                  <CheckCircle className="mr-2" size={20} />
                )}
                <p>{notification.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              <div className="relative">
                <User
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={20}
                />
                <input
                  type="text"
                  placeholder="E-posta veya Kullanıcı Adı"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 text-white border border-gray-600'
                      : 'bg-gray-50 text-gray-800 border border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-12 pr-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'bg-gray-50 text-gray-800 border border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    size={20}
                  />
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'bg-gray-50 text-gray-800 border border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={20}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-50 text-gray-800 border border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } hover:text-gray-700 focus:outline-none`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2 px-4 flex items-center justify-center rounded-lg ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors duration-300`}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </p>
            <button
              onClick={toggleAuthMode}
              className={`mt-2 font-semibold ${
                darkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
              disabled={isLoading}
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthComponent;