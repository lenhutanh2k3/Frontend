import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllCategories, deleteCategory } from '../../../features/category/categorySlice';
import Button from '../../../components/common/Button';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTags } from 'react-icons/fa';

const AdminCategoriesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categories, loading, error, pagination } = useSelector((state) => state.category);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        dispatch(getAllCategories({ page: currentPage, limit }));
    }, [dispatch, currentPage]);

   

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? ')) {
            try {
                await dispatch(deleteCategory(categoryId)).unwrap();
                dispatch(getAllCategories({ page: currentPage, limit }));
            } catch (err) {
                console.error('Delete category error:', err);
            }
        }
    };

    const handleEditCategory = (categoryId) => {
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center">
                    <FaTags className="mr-3 text-blue-600" /> Quản lý Danh mục
                </h1>
                <Button
                    onClick={() => navigate('/admin/categories/create')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <FaPlus className="mr-2" /> Thêm Danh mục
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải danh sách danh mục...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 flex items-center">
                        <FaTimes className="mr-2 text-red-500" /> Không tìm thấy danh mục nào.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên Danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 line-clamp-2">{category.description || 'Chưa có mô tả'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-3">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition duration-150"
                                                        onClick={() => handleEditCategory(category._id)}
                                                        title="Chỉnh sửa danh mục"
                                                    >
                                                        <FaEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-150"
                                                        onClick={() => handleDeleteCategory(category._id)}
                                                        title="Xóa danh mục"
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

export default AdminCategoriesPage;