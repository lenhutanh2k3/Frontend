// AddressManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAddresses, createAddress, updateAddress } from '../../features/address/addressSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import { FaEdit, FaPlus, FaHome, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import NavbarUser from '../../components/common/NavbarUser';

const AddressManagementPage = () => {
    const dispatch = useDispatch();
    const { addresses, loading, error } = useSelector((state) => state.address);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        address: '',
        fullName: '',
        phoneNumber: '',
        ward: '',
        district: '',
        city: '',
        addressType: 'home',
        isDefault: false,
    });
    const [formErrors, setFormErrors] = useState({}); // Thêm state cho lỗi form

    useEffect(() => { // Giữ nguyên
        dispatch(getAddresses());
    }, [dispatch]);

    useEffect(() => { // Giữ nguyên
        if (editingAddress) {
            setFormData({
                address: editingAddress.address || '',
                fullName: editingAddress.fullName || '',
                phoneNumber: editingAddress.phoneNumber || '',
                ward: editingAddress.ward || '',
                district: editingAddress.district || '',
                city: editingAddress.city || '',
                addressType: editingAddress.addressType || 'home',
                isDefault: editingAddress.isDefault || false,
            });
            setShowForm(true);
        } else {
            setFormData({
                address: '',
                fullName: '',
                phoneNumber: '',
                ward: '',
                district: '',
                city: '',
                addressType: 'home',
                isDefault: false,
            });
        }
        setFormErrors({}); // Reset lỗi khi đổi trạng thái form
    }, [editingAddress]);

    const validateForm = () => { // THÊM HÀM VALIDATE
        const newErrors = {};
        if (!formData.address) newErrors.address = 'Địa chỉ không được để trống';
        if (!formData.fullName) newErrors.fullName = 'Họ và tên không được để trống';
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Số điện thoại không được để trống';
        } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại phải đủ 10 số và bắt đầu bằng số 0.';
        }
        if (!formData.ward) newErrors.ward = 'Phường/Xã không được để trống';
        if (!formData.district) newErrors.district = 'Quận/Huyện không được để trống';
        if (!formData.city) newErrors.city = 'Tỉnh/Thành phố không được để trống';

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => { // SỬA ĐỔI để clear error khi gõ
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) { // Dùng hàm validateForm mới
            toast.error('Vui lòng kiểm tra lại thông tin địa chỉ.'); // Thông báo chung khi có lỗi validate
            return;
        }

        let submitData = { ...formData };
        if (formData.isDefault) {
            // Nếu chọn làm mặc định, tự động bỏ isDefault ở các địa chỉ khác (trên frontend)
            // (Backend nên xử lý lại, nhưng tạm thời xử lý ở frontend để UX tốt)
            const otherDefault = addresses.find(addr => addr.isDefault && (!editingAddress || addr._id !== editingAddress._id));
            if (otherDefault) {
                // Nếu đã có địa chỉ mặc định khác, bỏ isDefault của nó (chỉ gửi 1 isDefault=true)
                // Có thể gửi API update cho địa chỉ cũ, hoặc chỉ gửi 1 địa chỉ mới với isDefault=true
                // Ở đây chỉ gửi 1 địa chỉ mới với isDefault=true, backend cần xử lý đúng
            }
        }
        try {
            if (editingAddress) {
                await dispatch(updateAddress({ id: editingAddress._id, addressData: submitData })).unwrap();
                window.location.reload(); // Reload lại trang sau khi cập nhật địa chỉ thành công
            } else {
                await dispatch(createAddress(submitData)).unwrap();
            }
            setShowForm(false);
            setEditingAddress(null);
            setFormErrors({}); // Reset errors
        } catch (err) {
            // Lỗi đã được toast bởi thunk, không cần toast thêm ở đây
            console.error('Submit address failed:', err);
        }
    };

    const handleEdit = (address) => { // Giữ nguyên
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleAddClick = () => { // Giữ nguyên
        setEditingAddress(null);
        setShowForm(true);
    };

    const handleCancel = () => { // Giữ nguyên
        setShowForm(false);
        setEditingAddress(null);
        setFormErrors({}); // Reset errors
    };

    const getAddressTypeIcon = (type) => { // Giữ nguyên
        switch (type) {
            case 'home': return <FaHome className="text-blue-500" />;
            case 'office': return <FaBuilding className="text-green-500" />;
            default: return <FaMapMarkerAlt className="text-gray-500" />;
        }
    };

    if (loading && addresses.length === 0) { // Giữ nguyên
        return <div className="flex-1 flex items-center justify-center text-lg text-gray-600">Đang tải địa chỉ...</div>;
    }

    if (error && addresses.length === 0) { // Giữ nguyên
        return <div className="flex-1 flex items-center justify-center text-lg text-red-600">Lỗi: {error}</div>;
    }

    return ( // Giữ nguyên phần JSX, chỉ thêm phần hiển thị lỗi cho Input
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    <NavbarUser />
                    <div className="lg:w-3/4 bg-white p-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-blue-600 pb-3">Địa chỉ giao hàng</h2>

                        {!showForm && (
                            <Button onClick={handleAddClick} className="mb-6 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                                <FaPlus className="mr-2" /> Thêm địa chỉ mới
                            </Button>
                        )}

                        {showForm ? (
                            <div className="p-6 border border-gray-200 rounded-xl mb-8 bg-gray-50 shadow-inner">
                                <h3 className="text-2xl font-bold mb-5 text-gray-700">
                                    {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Họ và tên */}
                                        <div>
                                            <Input
                                                label="Họ và tên"
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.fullName && <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>}
                                        </div>
                                        {/* Số điện thoại */}
                                        <div>
                                            <Input
                                                label="Số điện thoại"
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>}
                                        </div>
                                        {/* Tỉnh/Thành phố */}
                                        <div>
                                            <Input
                                                label="Tỉnh/Thành phố"
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                                        </div>
                                        {/* Quận/Huyện */}
                                        <div>
                                            <Input
                                                label="Quận/Huyện"
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.district ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.district && <p className="mt-1 text-sm text-red-500">{formErrors.district}</p>}
                                        </div>
                                        {/* Phường/Xã */}
                                        <div>
                                            <Input
                                                label="Phường/Xã"
                                                type="text"
                                                name="ward"
                                                value={formData.ward}
                                                onChange={handleChange}
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.ward ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.ward && <p className="mt-1 text-sm text-red-500">{formErrors.ward}</p>}
                                        </div>
                                        {/* Địa chỉ cụ thể */}
                                        <div className="col-span-1 md:col-span-2">
                                            <Input
                                                label="Địa chỉ cụ thể"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Số nhà, tên đường, tên tòa nhà..."
                                                required
                                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Loại địa chỉ</label>
                                            <select
                                                name="addressType"
                                                value={formData.addressType}
                                                onChange={handleChange}
                                                className="shadow border rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                                            >
                                                <option value="home">Nhà riêng</option>
                                                <option value="office">Cơ quan</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 md:col-span-2 flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                name="isDefault"
                                                checked={formData.isDefault}
                                                onChange={handleChange}
                                                className="mr-2 h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                                            />
                                            <label htmlFor="isDefault" className="text-base text-gray-700 font-medium">Đặt làm địa chỉ mặc định</label>
                                        </div>
                                    </div>
                                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                                    <div className="flex justify-end space-x-4 mt-8">
                                        <Button
                                            type="button"
                                            onClick={handleCancel}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                                        >
                                            {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {addresses.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8 text-lg">Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.</p>
                                ) : (
                                    addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className="border border-gray-200 rounded-xl p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:shadow-lg transition duration-300"
                                        >
                                            <div className="flex-1 mb-4 sm:mb-0">
                                                <p className="font-bold text-xl text-gray-800 flex items-center">
                                                    {addr.fullName}
                                                    {addr.isDefault && (
                                                        <span className="ml-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">Mặc định</span>
                                                    )}
                                                </p>
                                                <p className="text-gray-700 text-base flex items-center mt-1">
                                                    <span className="mr-2">{getAddressTypeIcon(addr.addressType)}</span>
                                                    {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                                                </p>
                                                <p className="text-gray-600 text-base mt-1">Điện thoại: {addr.phoneNumber}</p>
                                            </div>
                                            <div className="flex space-x-3 flex-shrink-0">
                                                <Button
                                                    onClick={() => handleEdit(addr)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-lg shadow-md hover:shadow-lg transition duration-300"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressManagementPage;
