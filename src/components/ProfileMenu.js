import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

const ProfileMenu = React.memo(({
  toggleDarkMode,
  darkMode,
  setActiveTab,
  handleLogout,
  userSettings
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleMenuItemClick = useCallback((action) => {
    action();
    setIsMenuOpen(false);
  }, []);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="relative focus:outline-none"
        aria-label="Profil Menüsü"
      >
        {userSettings.profileImage ? (
          <img
            src={userSettings.profileImage}
            alt="Profil"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shadow-sm"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <User
              className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
              size={24}
            />
          </div>
        )}
      </motion.button>

      {isMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black dark:bg-gray-900 z-40"
            onClick={toggleMenu}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-60 rounded-lg shadow-lg z-50 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userSettings.username || 'Kullanıcı'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userSettings.email || 'email@example.com'}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <MenuButton
                icon={darkMode ? Sun : Moon}
                text={darkMode ? 'Gündüz Modu' : 'Karanlık Mod'}
                onClick={() => handleMenuItemClick(toggleDarkMode)}
                darkMode={darkMode}
              />
              <MenuButton
                icon={SettingsIcon}
                text="Ayarlar"
                onClick={() => handleMenuItemClick(() => setActiveTab('settings'))}
                darkMode={darkMode}
              />
              <MenuButton
                icon={User}
                text="Profil"
                onClick={() => handleMenuItemClick(() => setActiveTab('profile'))}
                darkMode={darkMode}
              />
              {userSettings.isAdmin && (
                <MenuButton
                  icon={Shield}
                  text="Admin Paneli"
                  onClick={() => handleMenuItemClick(() => setActiveTab('admin'))}
                  darkMode={darkMode}
                />
              )}
              <MenuButton
                icon={LogOut}
                text="Çıkış Yap"
                onClick={() => handleMenuItemClick(handleLogout)}
                darkMode={darkMode}
              />
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
});

const MenuButton = React.memo(({ icon: Icon, text, onClick, darkMode }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2 text-sm ${
      darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
    } focus:outline-none`}
  >
    <Icon className="mr-2" size={20} />
    {text}
  </motion.button>
));

export default ProfileMenu;
