import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = ({ darkMode, apiUrl }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/admin/users`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setUsers(response.data);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Kullanıcılar yüklenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(
          `${apiUrl}/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        fetchUsers();
        setNotification({
          type: 'success',
          message: 'Kullanıcı başarıyla silindi.',
        });
      } catch (err) {
        setNotification({
          type: 'error',
          message: 'Kullanıcı silinirken bir hata oluştu.',
        });
      }
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await axios.put(
        `${apiUrl}/admin/users/${updatedUser._id}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setIsEditModalOpen(false);
      fetchUsers();
      setNotification({
        type: 'success',
        message: 'Kullanıcı başarıyla güncellendi.',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Kullanıcı güncellenirken bir hata oluştu.',
      });
    }
  };

  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  if (loading)
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full mx-auto mb-4"
          />
          Yükleniyor...
        </div>
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Users className="mr-3" size={32} />
        Admin Paneli
      </h1>

      {/* Bildirim Mesajları */}
      {notification.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-md flex items-center ${
            notification.type === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}
        >
          {notification.type === 'error' ? (
            <Trash2 className="mr-2" size={20} />
          ) : (
            <Edit className="mr-2" size={20} />
          )}
          {notification.message}
        </motion.div>
      )}

      <div className="mb-6 flex items-center">
        <div className="relative w-full">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            size={20}
          />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={handleSearch}
            className={`w-full pl-12 pr-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-gray-100 text-gray-800 border border-gray-300'
            } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr
              className={`${
                darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <th className="px-6 py-3 text-left">Kullanıcı Adı</th>
              <th className="px-6 py-3 text-left">E-posta</th>
              <th className="px-6 py-3 text-left">Öğrenilen Kelimeler</th>
              <th className="px-6 py-3 text-left">Günlük Seri</th>
              <th className="px-6 py-3 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr
                key={user._id}
                className={`${
                  index % 2 === 0
                    ? darkMode
                      ? 'bg-gray-800'
                      : 'bg-white'
                    : darkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.learnedWordsCount || 0}</td>
                <td className="px-6 py-4">{user.dailyStreak || 0}</td>
                <td className="px-6 py-4 flex justify-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditUser(user)}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Edit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteUser(user._id)}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      darkMode
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sayfalandırma */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
            darkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronLeft size={20} />
          Önceki
        </button>
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Sayfa {currentPage} / {Math.ceil(filteredUsers.length / usersPerPage)}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={indexOfLastUser >= filteredUsers.length}
          className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
            darkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } ${
            indexOfLastUser >= filteredUsers.length
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          Sonraki
          <ChevronRight size={20} />
        </button>
      </div>

      {isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
          darkMode={darkMode}
        />
      )}
    </motion.div>
  );
};

const EditUserModal = ({ user, onClose, onUpdate, darkMode }) => {
  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedUser);
  };

  // Animasyon varyantları
  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        darkMode ? 'bg-black bg-opacity-70' : 'bg-gray-800 bg-opacity-50'
      }`}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={modalVariants}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Kullanıcı Düzenle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}
            >
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedUser.username}
              onChange={handleChange}
              className={`w-full pl-4 pr-4 py-2 rounded-md ${
                darkMode
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}
            >
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              className={`w-full pl-4 pr-4 py-2 rounded-md ${
                darkMode
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              } focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              İptal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`px-4 py-2 rounded-md flex items-center transition-colors duration-300 ${
                darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Save size={18} className="mr-2" />
              Güncelle
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminPanel;