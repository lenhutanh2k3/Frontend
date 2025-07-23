// ✅ Footer.jsx (Đã chỉnh UI cho cân đối và hiện đại)
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowUp,
} from 'react-icons/fa';

const Newsletter = ({ className = '' }) => (
  <div className={`mt-8 ${className}`}>
    <h4 className="text-base font-semibold text-white mb-2">Đăng ký nhận tin</h4>
    <form className="flex rounded-lg overflow-hidden shadow-md" aria-label="Đăng ký nhận tin">
      <input
        type="email"
        placeholder="Email của bạn"
        className="flex-1 px-4 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        aria-label="Email của bạn"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm"
        aria-label="Đăng ký"
      >
        Đăng ký
      </button>
    </form>
  </div>
);

const Footer = ({ className = '', style = {} }) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer
      className={`bg-gradient-to-tr from-gray-900 to-gray-800 text-white ${className}`}
      style={style}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10 xl:gap-x-20">
          {/* Logo + Social */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaBook className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BookStore</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              BookStore - Nơi khám phá thế giới sách với hàng nghìn tựa sách đa dạng, từ văn học đến khoa học và công nghệ.
            </p>
            <div className="flex space-x-2 mt-2">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition">
                  <Icon className="text-white text-base" />
                </a>
              ))}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Trang chủ', '/'],
                ['Cửa hàng', '/bookstore'],
                ['Giới thiệu', '/about'],
                ['Liên hệ', '/contact'],
                ['Blog', '/blog'],
                ['FAQ', '/faq'],
              ].map(([text, href], idx) => (
                <li key={idx}>
                  <Link to={href} className="text-gray-300 hover:text-white transition-colors">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['Chính sách vận chuyển', '/shipping'],
                ['Chính sách đổi trả', '/return'],
                ['Chính sách bảo mật', '/privacy'],
                ['Điều khoản sử dụng', '/terms'],
                ['Tra cứu đơn hàng', '/track-order'],
                ['Hỗ trợ trực tuyến', '/support'],
              ].map(([text, href], idx) => (
                <li key={idx}>
                  <Link to={href} className="text-gray-300 hover:text-white transition-colors">
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact + Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <FaMapMarkerAlt className="text-blue-400 mt-1" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-blue-400" />
                <span>(028) 1234-5678 - 1900-1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-blue-400" />
                <span>support@bookstore.vn</span>
              </div>
            </div>
            <div className="mt-4">
              <Newsletter />
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-8">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 space-y-4 md:space-y-0">
          <span>© 2025 BookStore. Tất cả quyền được bảo lưu.</span>
          <div className="flex space-x-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition shadow-md"
            aria-label="Lên đầu trang"
          >
            <FaArrowUp className="text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
