import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  AlertTriangle,
  Save,
  CheckCircle,
  Target,
  Bell,
  Settings as SettingsIcon,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const Settings = ({
  userSettings,
  setUserSettings,
  darkMode
}) => {
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL;

  // CSV yükleme işlemi
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setNotification({
        type: 'error',
        message: 'Dosya boyutu 5MB\'dan küçük olmalıdır.'
      });
      return;
    }

    if (file.type !== 'text/csv') {
      setNotification({
        type: 'error',
        message: 'Lütfen sadece CSV dosyası yükleyin.'
      });
      return;
    }

    setIsLoading(true);
    setNotification({ type: '', message: '' });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const lines = content.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',');

          if (!headers.includes('Lehçe') || !headers.includes('Türkçe')) {
            throw new Error('Geçersiz CSV formatı. "Lehçe" ve "Türkçe" sütunları gereklidir.');
          }

          const words = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
              polish: values[0]?.trim(),
              turkish: values[1]?.trim(),
              phonetic: values[2]?.trim() || '',
              example: values[3]?.trim() || '',
              translation: values[4]?.trim() || '',
              difficulty: values[5]?.trim() || 'Orta'
            };
          });

          const token = localStorage.getItem('token');
          const response = await axios.post(
            `${API_URL}/words/bulk`,
            { words },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              }
            }
          );

          setNotification({
            type: 'success',
            message: `${response.data.length} kelime başarıyla yüklendi!`
          });

        } catch (error) {
          console.error('CSV işleme hatası:', error);
          setNotification({
            type: 'error',
            message: error.message || 'CSV dosyası işlenirken bir hata oluştu.'
          });
        }
      };

      reader.onerror = () => {
        setNotification({
          type: 'error',
          message: 'Dosya okuma hatası oluştu.'
        });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setNotification({
        type: 'error',
        message: 'Dosya yüklenirken bir hata oluştu.'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Örnek CSV indirme
  const handleDownloadSample = () => {
    const sampleContent =
      'polish,turkish,phonetic,example,translation,difficulty\n' +
      'dzień dobry,günaydın,[ʥɛɲ ˈdɔbrɨ],Dzień dobry! Jak się masz?,Günaydın! Nasılsın?,Kolay\n' +
      'dziękuję,teşekkür ederim,[ʥɛŋˈkujɛ],Dziękuję za pomoc.,Yardım için teşekkür ederim.,Kolay';

    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'ornek_kelime_listesi.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Kullanıcı ayarlarını güncelleme
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setNotification({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/user/settings`,
        {
          userId: userSettings.userId,
          settings: {
            dailyGoal: userSettings.dailyGoal,
            notificationEnabled: userSettings.notificationEnabled,
            notificationTime: userSettings.notificationTime
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setUserSettings(prev => ({
        ...prev,
        ...response.data.settings
      }));

      setNotification({
        type: 'success',
        message: 'Ayarlar başarıyla kaydedildi!'
      });
    } catch (error) {
      console.error('Ayar güncelleme hatası:', error);
      setNotification({
        type: 'error',
        message: 'Ayarlar güncellenirken bir hata oluştu.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } rounded-lg shadow-md p-6`}
    >
      <h2
        className={`text-2xl font-bold mb-6 flex items-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        <SettingsIcon className="mr-3" size={28} />
        Ayarlar
      </h2>

      <AnimatePresence>
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
            {notification.type === 'error' ? (
              <AlertTriangle className="mr-2" size={20} />
            ) : (
              <CheckCircle className="mr-2" size={20} />
            )}
            <p>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Kelime Listesi Ayarları */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <FileText className="mr-2" size={24} />
            Kelime Listesi Yönetimi
          </h3>

          <div className="space-y-4">
            {/* CSV Yükleme */}
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="csv-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload
                    className={`w-8 h-8 mb-3 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <p
                    className={`mb-2 text-sm text-center ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <span className="font-semibold">
                      CSV dosyasını buraya sürükleyin
                    </span>{' '}
                    veya yüklemek için tıklayın
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Maksimum dosya boyutu: 5MB
                  </p>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full px-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span
                            className={`text-xs font-semibold inline-block ${
                              darkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            Yükleniyor
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-semibold inline-block ${
                              darkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Örnek CSV İndirme */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadSample}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-300 ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="mr-2" size={18} />
                Örnek CSV İndir
              </button>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <Bell className="mr-2" size={24} />
            Bildirim Ayarları
          </h3>

          <div className="space-y-4">
            {/* Bildirim Zamanı */}
            <div>
              <label
                htmlFor="notificationTime"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Günlük Hatırlatma Zamanı
              </label>
              <input
                type="time"
                id="notificationTime"
                value={userSettings.notificationTime || '09:00'}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    notificationTime: e.target.value
                  }))
                }
                className={`mt-1 block w-full px-3 py-2 rounded-md ${
                  darkMode
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>

            {/* Bildirim Aktifliği */}
            <div className="flex items-center">
              <input
                id="notificationEnabled"
                type="checkbox"
                checked={userSettings.notificationEnabled}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    notificationEnabled: e.target.checked
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notificationEnabled"
                className={`ml-2 block text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Günlük hatırlatmaları etkinleştir
              </label>
            </div>
          </div>
        </div>

        {/* Hedef Ayarları */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <Target className="mr-2" size={24} />
            Hedef Ayarları
          </h3>

          <div>
            <label
              htmlFor="dailyGoal"
              className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Günlük Kelime Hedefi
            </label>
            <input
              type="number"
              id="dailyGoal"
              min="1"
              max="100"
              value={userSettings.dailyGoal || 10}
              onChange={(e) =>
                setUserSettings((prev) => ({
                  ...prev,
                  dailyGoal: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                }))
              }
              className={`mt-1 block w-full px-3 py-2 rounded-md ${
                darkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-blue-500 focus:border-blue-500`}
            />
            <p
              className={`mt-2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Her gün öğrenmeyi hedeflediğiniz kelime sayısı (1-100 arası)
            </p>
          </div>
        </div>

        {/* Veri Temizleme */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 flex items-center ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <Trash2 className="mr-2" size={24} />
            Veri Yönetimi
          </h3>

          <div className="space-y-4">
            <button
              onClick={() => {
                if (window.confirm('Tüm öğrenme verileriniz silinecek. Emin misiniz?')) {
                  // İlerleme verilerini sıfırla
                  setUserSettings(prev => ({
                    ...prev,
                    learnedWordsCount: 0,
                    dailyStreak: 0
                  }));
                  // API çağrısı yapılabilir
                }
              }}
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-300 ${
                darkMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <Trash2 className="mr-2" size={18} />
              İlerleme Verilerini Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-300 ${
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
              Ayarları Kaydet
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;