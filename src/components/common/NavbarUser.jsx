import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const defaultItems = [
  {
    to: '/profile',
    icon: <FaUser className="mr-3 text-blue-600" />,
    label: 'Thông tin tài khoản',
  },
  {
    to: '/addresses',
    icon: <FaMapMarkerAlt className="mr-3 text-blue-600" />,
    label: 'Địa chỉ giao hàng',
  },
  {
    to: '/change-password',
    icon: <FaLock className="mr-3 text-blue-600" />,
    label: 'Đổi mật khẩu',
  },
];

const NavbarUser = ({ className = '', style = {}, items = defaultItems, title = 'Tài khoản của bạn' }) => {
  return (
    <nav
      className={`lg:w-1/4 bg-white p-6 rounded-lg shadow-md ${className}`}
      style={style}
      aria-label="User navigation sidebar"
    >
      <h3 className="font-bold text-xl text-blue-700 mb-6 border-b-2 border-blue-600 pb-2">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.to}
              className="flex items-center py-2 px-4 rounded text-gray-700 font-semibold hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
              aria-label={item.label}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavbarUser;