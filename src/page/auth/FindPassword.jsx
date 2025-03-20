import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FindPassword = () => {
  const [error, setError] = useState(""); // 오류 메시지 상태
  const [user_id, setUser_id] = useState(""); // 아이디 상태
  const [user_email, setUser_email] = useState(""); // 이메일 상태
  const [message, setMessage] = useState(""); // 응답 메시지 상태
  const [isIdFocused, setIsIdFocused] = useState(false); // 아이디 필드 포커스
  const [isEmailFocused, setIsEmailFocused] = useState(false); // 이메일 필드 포커스
  const navigate = useNavigate(); // useNavigate 훅 사용 

  // 페이지 이동 핸들러
  const handleNavigate = (path) => {
    navigate(path);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 초기화
    setMessage(""); // 초기화

    if (!user_id || !user_email) {
      setError("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/find-pw", { // API 엔드포인트 확인
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id , user_email }),
      });

      const data = await response.json(); // JSON 변환

      // 성공 여부에 따라 메시지 업데이트
      if (data.success) {
        setMessage(data.message || "임시 비밀번호가 이메일로 전송되었습니다.");

        // ✅ `temporaryPassword`가 백엔드에서 반환되는지 확인
        console.log("✅ 백엔드에서 받은 temporaryPassword:", data.temporaryPassword);

        if (!data.temporaryPassword) {
          console.error("❌ 서버에서 temporaryPassword를 반환하지 않음!");
          return;
      }

        // ✅ user_id를 localStorage에 저장
        console.log("✅ 저장된 user_id:", user_id);
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("temporaryPassword", data.temporaryPassword); // ✅ 저장

        // ✅ 성공 시 /change-pw 페이지로 이동
      setTimeout(() => {
        navigate("/change-pw");
      }, 2000); // 2초 후 이동 (사용자에게 메시지 보여주기 위해)

      } else {
        setError(data.message || "비밀번호 찾기에 실패했습니다.");
      }

    } catch (error) {
      setError("서버에 오류가 발생하였습니다. 나중에 다시 시도해주세요.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col font-['Noto_Sans_KR']"
      style={{ backgroundImage: "url('/images/korea_pw.jpg')" }}
    >
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div>
            <img
              alt="Logo"
              src="/images/icon_image/Yeoul_Logo.png"
              className="h-17 mx-auto cursor-pointer"
              onClick={() => handleNavigate("/")} // 함수 단순화
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

              {/* 아이디 입력 필드 */}
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className={`fas fa-user ${isIdFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </span>
                  <input
                    id="user_id"
                    name="user_id" //name 수정 (fetch body와 일치)
                    type="text"
                    maxLength={12}
                    required
                    value={user_id}
                    onChange={(e) => setUser_id(e.target.value)}
                    onFocus={() => setIsIdFocused(true)}
                    onBlur={() => setIsIdFocused(false)}
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="아이디를 입력하세요."
                  />
                </div>
              </div>

              {/* 이메일 입력 필드 */}
              <div>
                <label htmlFor="user_email" className="block mb-1 text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className={`fas fa-envelope ${isEmailFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                  </span>
                  <input
                    id="user_email"
                    name="user_email"
                    type="email"
                    required
                    value={user_email}
                    onChange={(e) => setUser_email(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    className="!rounded-button block w-full pl-10 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="이메일을 입력하세요."
                  />
                </div>
              </div>
            </div>

            {/* 메시지 출력 */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}

            <div>
              <button
                type="submit"
                disabled={!user_id || !user_email}
                className={`!rounded-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white ${
                  user_id && user_email ? "bg-orange-500 hover:bg-orange-600" : "bg-orange-500 cursor-not-allowed"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom`}
              >
                비밀번호 찾기
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <button onClick={() => handleNavigate("/find-id")} className="text-black-500 hover:text-orange-500">
                아이디 찾기
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={() => handleNavigate("/login")} className="text-black-500 hover:text-orange-500">
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
