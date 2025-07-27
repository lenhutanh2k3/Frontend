import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile, getProfile } from '../../features/profile/profileSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import NavbarUser from '../../components/common/NavbarUser';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth); 
  const { profile, loading: profileLoading, error: profileError } = useSelector((state) => state.profile);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profilePicture: null, 
    previewPicture: null,
  });
  const [errors, setErrors] = useState({}); 

  useEffect(() => {
    if (authUser?._id) { 
      dispatch(getProfile()); 
    }
  }, [dispatch, authUser?._id]);

  // Cập nhật profileData khi profile từ Redux state thay đổi
  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || '',
        email: profile.email || authUser?.email || '', // Ưu tiên profile, fallback về authUser
        phoneNumber: profile.phoneNumber || '',
        profilePicture: null, // Luôn reset file input
        previewPicture: profile.profilePicture
          ? `${import.meta.env.VITE_USER_SERVICE}${profile.profilePicture}` // Đảm bảo URL đúng
          : null,
      });
    } else if (authUser) { // Nếu profile chưa load hoặc null, dùng dữ liệu từ authUser (cho trường hợp mới đăng ký hoặc chưa có profile đầy đủ)
      setProfileData(prev => ({
        ...prev,
        email: authUser.email || '',
        fullName: authUser.fullName || '',
        phoneNumber: authUser.phoneNumber || '',
        previewPicture: authUser.profilePicture
          ? `${import.meta.env.VITE_USER_SERVICE}${authUser.profilePicture}`
          : null,
      }));
    }
  }, [profile, authUser]);


  // Hàm validate form
  const validateForm = () => {
    const newErrors = {};
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống.';
    }
    // Regex cho số điện thoại 10 số bắt đầu bằng 0
    if (profileData.phoneNumber && !/^0\d{9}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải đủ 10 số và bắt đầu bằng số 0.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    // Clear error khi người dùng bắt đầu gõ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Vui lòng chọn file ảnh (JPEG, PNG, hoặc GIF)');
        setProfileData((prev) => ({ ...prev, profilePicture: null, previewPicture: profile?.profilePicture ? `${import.meta.env.VITE_USER_SERVICE}${profile.profilePicture}` : null })); // Revert to old picture
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Ảnh phải nhỏ hơn 5MB');
        setProfileData((prev) => ({ ...prev, profilePicture: null, previewPicture: profile?.profilePicture ? `${import.meta.env.VITE_USER_SERVICE}${profile.profilePicture}` : null })); // Revert to old picture
        return;
      }

      setProfileData((prev) => ({
        ...prev,
        profilePicture: file,
        previewPicture: URL.createObjectURL(file), // Tạo URL tạm thời để preview
      }));
    } else { // Nếu người dùng bỏ chọn file
      setProfileData((prev) => ({
        ...prev,
        profilePicture: null,
        previewPicture: profile?.profilePicture // Quay lại ảnh cũ nếu có
          ? `${import.meta.env.VITE_USER_SERVICE}${profile.profilePicture}`
          : null,
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) { // Chạy validation form
      toast.error('Vui lòng kiểm tra lại thông tin hồ sơ.');
      return;
    }

    const isProfileChanged =
      profileData.fullName !== (profile?.fullName || '') ||
      profileData.phoneNumber !== (profile?.phoneNumber || '') ||
      profileData.profilePicture !== null; // Chỉ kiểm tra nếu file input không rỗng

    if (!isProfileChanged) {
      toast.info('Không có thông tin nào được thay đổi.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', profileData.fullName);
    formData.append('phoneNumber', profileData.phoneNumber);

    if (profileData.profilePicture instanceof File) {
      formData.append('profilePicture', profileData.profilePicture);
    }

    try {
      // updateProfile thunk đã được sửa để trả về user object đã cập nhật
      const updatedUser = await dispatch(updateProfile(formData)).unwrap();
      // toast.success('Cập nhật hồ sơ thành công!'); // Đã có toast trong thunk

      // Sau khi cập nhật thành công, nếu có preview URL cũ, hãy giải phóng nó
      if (profileData.previewPicture && profileData.profilePicture instanceof File) {
        URL.revokeObjectURL(profileData.previewPicture);
      }
      // Cập nhật lại state của form với dữ liệu mới từ backend (đặc biệt là profilePicture)
      setProfileData((prev) => ({
        ...prev,
        profilePicture: null, // Reset file input
        previewPicture: updatedUser?.profilePicture // Sử dụng đường dẫn ảnh mới từ response
          ? `${import.meta.env.VITE_USER_SERVICE}${updatedUser.profilePicture}`
          : null,
      }));
    } catch (error) {
      // Lỗi đã được toast bởi thunk, không cần toast thêm ở đây
      console.error('ProfilePage error:', error);
    }
  };

  const isLoading = profileLoading; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <NavbarUser />
          <div className="lg:w-3/4 bg-white p-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center border-b-4 border-blue-600 pb-4">
              Thông tin Hồ sơ
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col items-center justify-start bg-gray-50 p-6 rounded-xl shadow-inner text-center">
                <div className="relative w-40 h-40 mx-auto mb-4 group">
                  {profileData.previewPicture ? (
                    <img
                      src={profileData.previewPicture}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full border-4 border-blue-600 shadow-lg transform transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-semibold border-4 border-blue-600">
                      Không ảnh
                    </div>
                  )}
                  {/* Overlay cho nút thay đổi ảnh */}
                  <label htmlFor="file-upload" className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    <span className="text-white text-sm font-semibold">Thay đổi</span>
                  </label>
                </div>
                {profile?.username && ( // Hiển thị username nếu có trong profile
                  <h2 className="text-2xl font-bold text-gray-700 mt-2 mb-4 animate-fadeIn">
                    @{profile.username}
                  </h2>
                )}
                {authUser?.email && ( // Hiển thị email từ authUser nếu profile chưa load username
                  <p className="text-gray-600">Email: {authUser.email}</p>
                )}


                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-blue-700 transition duration-300 ease-in-out shadow-md hover:shadow-lg mt-4"
                >
                  Chọn ảnh mới
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif" // Giới hạn loại file
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {profileData.profilePicture instanceof File && (
                  <p className="text-sm text-gray-600 mt-3 italic">Đã chọn: {profileData.profilePicture.name}</p>
                )}
              </div>

              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl shadow-inner flex flex-col justify-center">
                <form onSubmit={handleProfileSubmit} encType="multipart/form-data" className="space-y-6">
                  {/* Họ và Tên */}
                  <div>
                    <Input
                      label="Họ và Tên"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 text-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      labelClassName="text-lg font-semibold text-gray-700 mb-2"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email (Disabled) */}
                  <div>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      disabled
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-lg"
                      labelClassName="text-lg font-semibold text-gray-700 mb-2"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <Input
                      label="Số điện thoại"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-200 text-lg ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      labelClassName="text-lg font-semibold text-gray-700 mb-2"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;