import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 추가

const FindPassword = () => {
  const [userId, setUserId] = useState(""); // 아이디 상태
  const [email, setEmail] = useState(""); // 이메일 상태
  const [isIdFocused, setIsIdFocused] = useState(false); // 이름 필드의 포커스 상태
  const [isEmailFocused, setIsEmailFocused] = useState(false); // 이메일 필드의 포커스 상태
  const navigate = useNavigate(); // useNavigate 훅 사용 

  // 로그인 페이지로 이동
  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  // 아이디 찾기 페이지로 이동
  const handleNavigateToFindId = () => {
    navigate("/find-id");
  };

  // 홈으로 이동
  const handleNavigateToHome = () => {
    navigate("/");
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userId && email) {
      alert("비밀번호 찾기 요청이 전송되었습니다.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col font-['Noto_Sans_KR']"
      style={{ backgroundImage: "url('/images/korea_pw.jpg')" }} // ✅ 배경 이미지 추가
    >
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div>
            <img
              className="mx-auto h-12 w-auto cursor-pointer"
              src="/images/Yeoul_Logo.png"
              alt="Logo"
              onClick={handleNavigateToHome} // ✅ 함수 분리
            />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              비밀번호 찾기
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              가입 시 등록한 아이디와 이메일을 입력해주세요.
            </p>
          </div>

          {/* 입력 폼 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* 이름 입력 필드 */}
              <div>
                <label
                  htmlFor="user-id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  아이디
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className={`fas fa-user ${isIdFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </span>
                  <input
                    id="user-id"
                    name="user-id"
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onFocus={() => setIsIdFocused(true)}  // 이름 필드 포커스 시
                    onBlur={() => setIsIdFocused(false)}  // 이름 필드 포커스 해제 시
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="아이디를 입력하세요."
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  이메일
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className={`fas fa-envelope ${isEmailFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}  // 이메일 필드 포커스 시
                    onBlur={() => setIsEmailFocused(false)}  // 이메일 필드 포커스 해제 시
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="이메일을 입력하세요."
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!userId || !email} // ✅ isFormValid 제거 후 간단히 처리
                className={`!rounded-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white ${userId && email
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-orange-500 cursor-not-allowed"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom`}
              >
                비밀번호 찾기
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <button
                onClick={handleNavigateToFindId} // 아이디 찾기 페이지로 이동
                className="text-black-500 hover:text-orange-500"
              >
                아이디 찾기
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleNavigateToLogin} // 로그인 페이지로 이동
                className="text-black-500 hover:text-orange-500"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FindPassword;
