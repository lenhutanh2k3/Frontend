import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaBook, FaSignOutAlt, FaGift, FaStar } from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              <FaTachometerAlt className="mr-3" />
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              <FaUsers className="mr-3" />
              Quản lý người dùng
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/books"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              <FaBook className="mr-3" />
              Quản lý sách
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              <FaBook className="mr-3" />
              Quản lý danh mục
            </NavLink>
          </li>
          <li className="mt-8 border-t border-gray-700 pt-4">
            
            <li>
              <NavLink
                to="/admin/publishers"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                <FaBook className="mr-3" />
                Quản lý nhà xuất bản
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/authors"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                <FaBook className="mr-3" />
                Quản lý tác giả 
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                <FaBook className="mr-3" />
                Quản lý đơn hàng
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/reviews"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                }
              >
                <FaStar className="mr-3" />
                Quản lý đánh giá
              </NavLink>
            </li>



          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
