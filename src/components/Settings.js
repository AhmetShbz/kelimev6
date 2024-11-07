// Settings.js

import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  Save,
  CheckCircle,
  Target,
  Bell,
  Settings as SettingsIcon,
} from 'lucide-react';
import { parseCSV } from '../utils/helpers';

const Settings = ({
  userSettings,
  setUserSettings,
  setWords,
  darkMode,
}) => {
  const [notification, setNotification] = useState({
    type: '',
    message: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsedWords = parseCSV(content);
          setWords(parsedWords);
          setNotification({
            type: 'success',
            message: 'Kelime listesi başarıyla yüklendi!',
          });
        } catch (err) {
          setNotification({
            type: 'error',
            message:
              'CSV dosyası işlenirken bir hata oluştu. Lütfen dosya formatını kontrol edin.',
          });
        }
      };
      reader.onerror = () => {
        setNotification({
          type: 'error',
          message: 'Dosya okuma hatası oluştu.',
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: 'Ayarlar başarıyla kaydedildi!',
      });
      setIsSaving(false);
    }, 1500);
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

      <div className="space-y-8">
        {/* Profil Ayarları */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Profil Ayarları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Günlük Hedef */}
            <div className="relative">
              <label
                htmlFor="dailyGoal"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Günlük Hedef (Kelime Sayısı)
              </label>
              <Target
                className={`absolute left-3 top-11 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={20}
              />
              <input
                type="number"
                name="dailyGoal"
                id="dailyGoal"
                value={userSettings.dailyGoal || ''}
                onChange={handleChange}
                className={`mt-1 block w-full pl-12 pr-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-900'
                } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                min="0"
                max="9999"
              />
            </div>

            {/* Bildirim Sıklığı */}
            <div className="relative">
              <label
                htmlFor="notificationFrequency"
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Bildirim Sıklığı
              </label>
              <Bell
                className={`absolute left-3 top-11 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={20}
              />
              <select
                name="notificationFrequency"
                id="notificationFrequency"
                value={userSettings.notificationFrequency || ''}
                onChange={handleChange}
                className={`mt-1 block w-full pl-12 pr-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-900'
                } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
              >
                <option value="">Seçiniz</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="never">Asla</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kelime Listesi Ayarları */}
        <div>
          <h3
            className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Kelime Listesi Ayarları
          </h3>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csv-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                darkMode
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
              }`}
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
                  (Maksimum boyut: 2MB)
                </p>
              </div>
              <input
                id="csv-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Bildirim Mesajları */}
      {notification.message && (
        <div
          className={`mt-6 p-4 rounded-md flex items-center ${
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
          {notification.message}
        </div>
      )}

      <button
        onClick={handleSaveSettings}
        disabled={isSaving}
        className={`mt-8 px-4 py-2 rounded-md flex items-center justify-center w-full transition-colors duration-300 ${
          darkMode
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSaving ? (
          <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Save className="mr-2" size={18} />
            Ayarları Kaydet
          </>
        )}
      </button>
    </div>
  );
};

export default Settings;
