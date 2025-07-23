import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllAuthors, deleteAuthor } from '../../../features/author/authorSlice';
import Button from '../../../components/common/Button';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUserEdit } from 'react-icons/fa';

const AdminAuthorsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { authors, loading, error, pagination } = useSelector((state) => state.author);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10; 
    useEffect(() => {
        // Gọi API với page và limit
        dispatch(getAllAuthors({ page: currentPage, limit }));
    }, [dispatch, currentPage]);

    

    const handleDeleteAuthor = async (authorId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tác giả này? Hành động này không thể hoàn tác nếu không có ràng buộc!')) {
            try {
                await dispatch(deleteAuthor(authorId)).unwrap();
                dispatch(getAllAuthors({ page: currentPage, limit }));
            } catch (err) {
                console.error('Delete author error:', err);
            }
        }
    };

    const handleEditAuthor = (authorId) => {
        navigate(`/admin/authors/edit/${authorId}`);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center">
                    <FaUserEdit className="mr-3 text-blue-600" /> Quản lý Tác giả
                </h1>
                <Button
                    onClick={() => navigate('/admin/authors/create')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <FaPlus className="mr-2" /> Thêm Tác giả
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải danh sách tác giả...</p>
                </div>
            ) : authors.length === 0 ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 flex items-center">
                        <FaTimes className="mr-2 text-red-500" /> Không tìm thấy tác giả nào.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tiểu sử</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {authors.map((author) => (
                                        <tr key={author._id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{author.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 line-clamp-2">{author.biography || 'Chưa có tiểu sử'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-3">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition duration-150"
                                                        onClick={() => handleEditAuthor(author._id)}
                                                        title="Chỉnh sửa tác giả"
                                                    >
                                                        <FaEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-150"
                                                        onClick={() => handleDeleteAuthor(author._id)}
                                                        title="Xóa tác giả"
                                                    >
                                                        <FaTrash className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân trang */}
                    {pagination && pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center items-center space-x-3">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${pagination.currentPage === number ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAuthorsPage;