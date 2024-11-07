import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  Shield,
  User,
  ChevronRight,
  Bell,
  HelpCircle,
  ChevronLeft,
  X,
  Check,
  Clock,
  Trash2,
} from 'lucide-react';

const ProfileMenu = React.memo(({
  toggleDarkMode,
  darkMode,
  setActiveTab,
  handleLogout,
  userSettings
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Ödeme başarılı',
      message: 'Pro üyelik ödemesi başarıyla gerçekleşti',
      time: '5 dakika önce',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Yeni özellik',
      message: 'Yeni AI destekli özellikler eklendi',
      time: '1 saat önce',
      read: false
    },
    {
      id: 3,
      type: 'pending',
      title: 'Sistem bakımı',
      message: 'Planlı bakım 24 saat içinde gerçekleşecek',
      time: '3 saat önce',
      read: true
    }
  ]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setCurrentView('main');
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.1
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const NotificationIcon = ({ type }) => {
    switch (type) {
      case 'success':
        return <Check className="text-emerald-500" size={18} />;
      case 'info':
        return <Bell className="text-blue-500" size={18} />;
      case 'pending':
        return <Clock className="text-amber-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  const NotificationItem = ({ notification }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);

    const handleDragEnd = (e, { offset, velocity }) => {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        setIsDeleting(true);
        setTimeout(() => deleteNotification(notification.id), 200);
      } else {
        setSwipeOffset(0);
      }
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isDeleting ? 0 : 1,
          y: isDeleting ? -20 : 0,
          x: swipeOffset
        }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        onClick={() => !notification.read && markAsRead(notification.id)}
        className={`relative p-4 rounded-xl mb-2 cursor-pointer transform transition-all
          ${darkMode
            ? notification.read ? 'bg-gray-800/50' : 'bg-gray-800'
            : notification.read ? 'bg-gray-50' : 'bg-white'
          }
          ${!notification.read && 'ring-1 ring-inset ring-blue-500/10'}
          hover:shadow-lg dark:hover:shadow-black/30
        `}
      >
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-50 hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(true);
              setTimeout(() => deleteNotification(notification.id), 200);
            }}
            className={`p-1.5 rounded-full
              ${darkMode
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-red-50 text-red-500'
              }
            `}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>

        <motion.div
          animate={{ x: swipeOffset }}
          className="flex items-start gap-3"
        >
          <div className={`p-2 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <NotificationIcon type={notification.type} />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {notification.title}
              </p>
              <span className={`text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {notification.time}
              </span>
            </div>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>
            {!notification.read && (
              <div className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full
                ${darkMode
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'bg-blue-500/10 text-blue-700'
                }`}
              >
                Okunmadı
              </div>
            )}
          </div>
        </motion.div>

        <div className="absolute inset-y-0 left-0 flex items-center -ml-4 opacity-50 pointer-events-none">
          <motion.div
            animate={{ opacity: swipeOffset < -50 ? 1 : 0 }}
            className="bg-red-500/10 text-red-500 p-2 rounded-lg"
          >
            <Trash2 size={20} />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const MenuButton = React.memo(({
    icon: Icon,
    text,
    subText,
    onClick,
    darkMode,
    danger,
    badge
  }) => (
    <motion.button
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`
        group flex items-center justify-between w-full px-3 py-2.5 rounded-xl
        ${danger
          ? darkMode
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-red-600 hover:bg-red-50'
          : darkMode
            ? 'text-gray-200 hover:bg-gray-700/50'
            : 'text-gray-700 hover:bg-gray-50'
        }
        transition-all duration-200 focus:outline-none
      `}
    >
      <div className="flex items-center min-w-0">
        <div className={`
          flex items-center justify-center w-9 h-9 rounded-lg mr-3
          ${danger
            ? darkMode
              ? 'text-red-400 bg-red-500/10 group-hover:bg-red-500/20'
              : 'text-red-600 bg-red-50 group-hover:bg-red-100'
            : darkMode
              ? 'text-gray-300 bg-gray-700/50 group-hover:bg-gray-700'
              : 'text-gray-700 bg-gray-50 group-hover:bg-gray-100'
          }
          transition-colors duration-200
        `}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{text}</div>
          {subText && (
            <div className={`text-xs truncate
              ${danger
                ? darkMode ? 'text-red-400/60' : 'text-red-600/60'
                : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {subText}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {badge && (
          <div className={`
            px-2 py-0.5 rounded-full text-xs font-medium mr-2
            ${darkMode
              ? 'bg-violet-500/20 text-violet-300'
              : 'bg-blue-500/10 text-blue-700'
            }
          `}>
            {badge}
          </div>
        )}
        <ChevronRight
          size={16}
          className={`
            ${danger
              ? darkMode ? 'text-red-400/30' : 'text-red-600/30'
              : darkMode ? 'text-gray-600' : 'text-gray-400'
            }
            group-hover:opacity-100 transition-opacity
          `}
        />
      </div>
    </motion.button>
  ));

  const renderContent = () => {
    switch (currentView) {
      case 'notifications':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="h-full"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentView('main')}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <h2 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Bildirimler
                  </h2>
                </div>

                {notifications.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotifications([])}
                    className={`px-3 py-1.5 text-sm rounded-lg
                      ${darkMode
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-red-50 text-red-500'
                      }
                    `}
                  >
                    Tümünü Sil
                  </motion.button>
                )}
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[400px]">
              <AnimatePresence>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center py-8 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <Bell className="mx-auto mb-3 opacity-50" size={24} />
                    <p>Henüz bildirim bulunmuyor</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
          >
            {/* Profil Bilgileri */}
            <div className={`p-5 border-b
              ${darkMode ? 'border-gray-700/75' : 'border-gray-100'}`}
            >
              <div className="flex items-center space-x-4">
                {userSettings.profileImage ? (
                  <div className="relative">
                    <img
                      src={userSettings.profileImage}
                      alt="Profil"
                      className={`w-14 h-14 rounded-full object-cover ring-2
                        ${darkMode
                          ? 'ring-violet-500'
                          : 'ring-blue-500'
                        }`}
                    />
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2
                      ${darkMode
                        ? 'bg-emerald-500 border-gray-900'
                        : 'bg-emerald-500 border-white'
                      }`}
                    />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center
                    ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <User size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userSettings.name || 'Kullanıcı'}
                  </div>
                  <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userSettings.email || 'kullanici@örnek.com'}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMenu}
                  className={`p-2 rounded-lg
                    ${darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <MenuButton
                icon={Bell}
                text="Bildirimler"
                subText="Tüm bildirimlerinizi görüntüleyin"
                onClick={() => setCurrentView('notifications')}
                darkMode={darkMode}
                badge={notifications.filter(n => !n.read).length || null}
              />
              <MenuButton
                icon={User}
                text="Hesap Ayarları"
                subText="Profil ve gizlilik ayarlarınızı yönetin"
                onClick={() => setActiveTab('settings')}
                darkMode={darkMode}
              />
              <MenuButton
                icon={Shield}
                text="Güvenlik"
                subText="Güvenlik tercihlerinizi yapılandırın"
                onClick={() => setActiveTab('security')}
                darkMode={darkMode}
              />
              <MenuButton
                icon={HelpCircle}
                text="Yardım Merkezi"
                subText="SSS ve destek dokümantasyonu"
                onClick={() => setActiveTab('help')}
                darkMode={darkMode}
              />
              <MenuButton
                icon={darkMode ? Sun : Moon}
                text={darkMode ? 'Açık Mod' : 'Koyu Mod'}
                subText="Görünüm tercihlerinizi ayarlayın"
                onClick={toggleDarkMode}
                darkMode={darkMode}
              />
              <MenuButton
                icon={LogOut}
                text="Çıkış Yap"
                subText="Hesabınızdan güvenli çıkış yapın"
                onClick={handleLogout}
                darkMode={darkMode}
                danger
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={toggleMenu}
        className="relative focus:outline-none group"
        aria-label="Profil Menüsü"
      >
        <div className="relative">
          {userSettings.profileImage ? (
            <div className="relative">
              <img
                src={userSettings.profileImage}
                alt="Profil"
                className={`w-12 h-12 rounded-full object-cover ring-2 ring-offset-2
                  ${darkMode
                    ? 'ring-offset-gray-900 ring-violet-500 group-hover:ring-violet-400'
                    : 'ring-offset-white ring-blue-500 group-hover:ring-blue-600'
                  }
                  transition-all duration-300 transform`}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`absolute -top-1 -right-1 px-2 py-0.5 text-xs rounded-full
                  ${darkMode
                    ? 'bg-violet-500 text-white'
                    : 'bg-blue-500 text-white'
                  }`}
              >
                Pro
              </motion.div>
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center
              ${darkMode
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }
              transition-all duration-300 transform`}
            >
              <User className="text-white" size={26} />
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2
            ${darkMode
              ? 'border-gray-900 bg-emerald-500'
              : 'border-white bg-emerald-500'
            }`}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 backdrop-blur-sm z-40
                ${darkMode ? 'bg-black/50' : 'bg-gray-900/20'}`}
              onClick={toggleMenu}
            />

            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`absolute right-0 mt-3 w-80 rounded-2xl z-50 overflow-hidden
                ${darkMode
                  ? 'shadow-lg shadow-violet-500/10'
                  : 'shadow-xl shadow-blue-500/10'
                }`}
            >
              <div className={`backdrop-blur-xl
                ${darkMode
                  ? 'bg-gray-800/95'
                  : 'bg-white/95'
                }`}>
                <AnimatePresence mode="wait">
                  {renderContent()}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

const MenuButton = React.memo(({
  icon: Icon,
  text,
  subText,
  onClick,
  darkMode,
  danger,
  badge
}) => (
  <motion.button
    whileHover={{ scale: 1.01, x: 4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    onClick={onClick}
    className={`
      group flex items-center justify-between w-full px-3 py-2.5 rounded-xl
      ${danger
        ? darkMode
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-red-600 hover:bg-red-50'
        : darkMode
          ? 'text-gray-200 hover:bg-gray-700/50'
          : 'text-gray-700 hover:bg-gray-50'
      }
      transition-all duration-200 focus:outline-none
    `}
  >
    <div className="flex items-center min-w-0">
      <div className={`
        flex items-center justify-center w-9 h-9 rounded-lg mr-3
        ${danger
          ? darkMode
            ? 'text-red-400 bg-red-500/10 group-hover:bg-red-500/20'
            : 'text-red-600 bg-red-50 group-hover:bg-red-100'
          : darkMode
            ? 'text-gray-300 bg-gray-700/50 group-hover:bg-gray-700'
            : 'text-gray-700 bg-gray-50 group-hover:bg-gray-100'
        }
        transition-colors duration-200
      `}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{text}</div>
        {subText && (
          <div className={`text-xs truncate
            ${danger
              ? darkMode ? 'text-red-400/60' : 'text-red-600/60'
              : darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {subText}
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center">
      {badge && (
        <div className={`
          px-2 py-0.5 rounded-full text-xs font-medium mr-2
          ${darkMode
            ? 'bg-violet-500/20 text-violet-300'
            : 'bg-blue-500/10 text-blue-700'
          }
        `}>
          {badge}
        </div>
      )}
      <ChevronRight
        size={16}
        className={`
          ${danger
            ? darkMode ? 'text-red-400/30' : 'text-red-600/30'
            : darkMode ? 'text-gray-600' : 'text-gray-400'
          }
          group-hover:opacity-100 transition-opacity
        `}
      />
    </div>
  </motion.button>
));

export default ProfileMenu;