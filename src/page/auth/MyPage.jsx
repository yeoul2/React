import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaPencilAlt, FaShareAlt, FaTrashAlt } from "react-icons/fa";

const MyPage = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-gray-50 font-['Noto Sans KR'] min-h-screen">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16">
          <div className="flex items-center">
            <img className="h-8 w-auto" src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" alt="로고" />
          </div>
          <div className="flex items-center">
            <button className="bg-orange-500 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-orange-600">
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8">
          {/* 프로필 정보 */}
          <section className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-6">프로필 정보</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">이름</p>
                  <p className="text-sm text-gray-900">김여행</p>
                </div>
                <button className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md">
                  수정
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">아이디</p>
                <p className="text-sm text-gray-900">travel_kim</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">이메일</p>
                  <p className="text-sm text-gray-900">travel_kim@example.com</p>
                </div>
                <button className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md">
                  수정
                </button>
              </div>
            </div>
          </section>

          {/* 비밀번호 변경 */}
          <section className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-6">비밀번호 변경</h2>
            <form className="space-y-4">
              {["current", "new", "confirm"].map((field, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "current" ? "현재 비밀번호" : field === "new" ? "새 비밀번호" : "새 비밀번호 확인"}
                  </label>
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    name={field}
                    value={passwords[field]}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePassword(field)}
                  >
                    {showPassword[field] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              ))}
              <div className="flex justify-end">
                <button className="bg-orange-500 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-orange-600">
                  변경하기
                </button>
              </div>
            </form>
          </section>

          {/* 저장된 여행 코스 */}
          <section className="bg-white shadow rounded-lg p-5 col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">저장된 여행 코스</h2>
              <span className="text-sm text-gray-500">3/5 코스</span>
            </div>

            {/* 여행 코스 목록 */}
            {[
              { title: "제주도 3박 4일 코스", cost: "580,000원", transport: "렌터카", time: "5시간", distance: "120km", date: "2024.03.15 - 03.18" },
              { title: "부산 여행 코스", cost: "320,000원", transport: "대중교통", time: "3시간", distance: "25km", date: "2024.02.20 - 02.22" },
              { title: "강원도 힐링 코스", cost: "450,000원", transport: "버스", time: "4시간", distance: "180km", date: "2024.01.10 - 01.13" },
            ].map((trip, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{trip.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{trip.date}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrashAlt />
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="text-orange-500 border border-orange-500 px-3 py-1.5 text-sm font-medium rounded-md">
                    <FaPencilAlt className="mr-1 inline" /> 후기 작성
                  </button>
                  <button className="text-orange-500 border border-orange-500 px-3 py-1.5 text-sm font-medium rounded-md">
                    <FaShareAlt className="mr-1 inline" /> 공유하기
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* 회원 탈퇴 버튼 */}
        <div className="flex justify-end mt-4">
          <button className="text-red-600 border border-red-600 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50">
            회원 탈퇴
          </button>
        </div>
      </main>
    </div>
  );
};

export default MyPage;
