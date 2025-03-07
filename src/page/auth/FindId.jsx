import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가

const FindId = () => {
  // 입력값과 결과 메시지 상태 관리
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [userId, setUserId] = useState(null); // 찾은 아이디 저장
  const [error, setError] = useState(null); // 오류 메시지 저장
  const [isNameFocused, setIsNameFocused] = useState(false); // 이름 필드의 포커스 상태
  const [isEmailFocused, setIsEmailFocused] = useState(false); // 이메일 필드의 포커스 상태
  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 useNavigate 사용

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 아이디 찾기 요청 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError(null); // 이전 오류 초기화
      setUserId(null); // 이전 아이디 초기화

      const response = await fetch("http://localhost:7007/api/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId); // 찾은 아이디 저장
      } else {
        setUserId(null);
        setError("입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      setError("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col font-['Noto_Sans_KR']"
      style={{ backgroundImage: "url('/images/korea_id.jpg')" }} // ✅ 배경 추가
    >
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white py-12 px-8 rounded-lg shadow-sm">
          {/* 로고 및 제목 */}
          <div className="text-center">
            <img
              className="mx-auto h-12 w-auto cursor-pointer"
              src="/images/Yeoul_Logo.png"
              alt="Logo"
              onClick={() => navigate("/")} // ✅ useNavigate 사용 (새로고침 없이 이동)
            />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              아이디 찾기
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              가입 시 등록한 이메일로 아이디를 찾을 수 있습니다.
            </p>
          </div>

          {/* 입력 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* 이름 입력 필드 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이름
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className={`fas fa-user ${isNameFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setIsNameFocused(true)}  // 이름 필드 포커스 시
                    onBlur={() => setIsNameFocused(false)}  // 이름 필드 포커스 해제 시
                    required
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="이름을 입력해주세요."
                  />
                </div>
              </div>

              {/* 이메일 입력 필드 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="relative">
                  {/* 아이콘 */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <i className={`fas fa-envelope ${isEmailFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </div>

                  {/* 입력 필드 */}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setIsEmailFocused(true)}  // 이메일 필드 포커스 시
                    onBlur={() => setIsEmailFocused(false)}  // 이메일 필드 포커스 해제 시
                    required
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="이메일을 입력해주세요."
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2.5 rounded-md text-sm font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500"
              >
                아이디 찾기
              </button>
              <div className="mt-6 text-center text-sm">
                <button
                  onClick={() => navigate("/login")} // ✅ useNavigate 사용
                  className="text-gray-900 hover:text-orange-500"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </div>
          </form>

          {/* 결과 메시지 (조건부 렌더링) */}
          {userId && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
              <p className="flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                <span>회원님의 아이디는 <strong>{userId}</strong> 입니다.</span>
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              <p className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FindId;
