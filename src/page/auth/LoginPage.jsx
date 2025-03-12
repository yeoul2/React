import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ 눈 아이콘 추가
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [user_id, setUser_id] = useState("");
  const [user_pw, setUser_pw] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isIdFocused, setIsIdFocused] = useState(false); // 아이디 필드 포커스 상태
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // 비밀번호 필드 포커스 상태
  const [showPassword, setShowPassword] = useState(false); // 👀 비밀번호 표시 여부

  // 로그인 요청 (DB 및 API 연동 가정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔵 로그인 버튼 클릭됨"); // ✅ 로그인 버튼 클릭 로그 추가
    console.log("📤 로그인 요청 데이터:", { user_id, user_pw }); // ✅ 요청 데이터 확인
    console.log("로그인 요청이 실행됨!")
    try {
      const response = await axios.post("/api/login", {
        user_id,

      }, { withCredentials: true });

      console.log("✅ 로그인 성공, 응답 데이터:", response.data); // ✅ 응답 확인
      // ✅ 로그인 성공: JWT 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", response.data.accessToken); //jwt 토큰 저장
      localStorage.setItem("user_id", response.data.user_id); // 사용자 ID 저장

      // ✅ 새로고침해도 로그인 유지하도록 전역 상태 업데이트 (이 코드가 없으면 헤더에서 로그인 인식을 못 함)
      window.dispatchEvent(new Event("storage"));

      alert("로그인 성공!");
      navigate("/"); // ✅ 로그인 성공 시 메인 페이지로 이동
      //window.location.reload();

      console.log("서버응답 :", response.data)

    } catch (error) {
      console.error("로그인 오류:", error);
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };


  // 구글 로그인 API 호출 함수
  const handleGoogleLogin = () => {
    // 구글 로그인 API 연동 (예시)
    //window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=token&scope=email";
    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=accessToken&scope=email";
  };

  // 네이버 로그인 API 호출 함수
  const handleNaverLogin = () => {
    // 네이버 로그인 API 연동 (예시)
    window.location.href = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=YOUR_NAVER_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=STATE";
  };

  // ✅ 카카오 로그인 API 호출 함수
  const handleKakaoLogin = () => {
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=YOUR_KAKAO_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code`;
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('/images/korea_trip.jpg')`,
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              className="mx-auto h-12 w-auto cursor-pointer"
              src="/images/Yeoul_Logo.png"
              alt="Logo"
              onClick={() => navigate("/")}
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">로그인</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 아이디 입력 필드 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">아이디</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className={`fas fa-user ${isIdFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                </div>
                <input
                  type="text"
                  maxLength={12} // 최대 12자 제한 추가
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="아이디를 입력하세요"
                  value={user_id}
                  onChange={(e) => setUser_id(e.target.value)}
                  onFocus={() => setIsIdFocused(true)}
                  onBlur={() => setIsIdFocused(false)}
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 (눈 모양 아이콘 추가) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">비밀번호</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className={`fas fa-lock ${isPasswordFocused ? "text-orange-500" : "text-gray-400"}`}></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"} // 🔥 상태에 따라 비밀번호 보이기/숨기기
                  maxLength={16} // 최대 16자 제한 추가
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="비밀번호를 입력하세요."
                  value={user_pw}
                  onChange={(e) => setUser_pw(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
                {/* 비밀번호 보이기/숨기기 버튼 */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()} // ✅ 포커스 유지
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* 로그인 유지 체크박스 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label className="ml-2 text-sm text-gray-700">로그인 상태 유지</label>
            </div>

            {/* 로그인 버튼 */}
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg">
              로그인
            </button>
          </form>

          {/* SNS 로그인 버튼들 */}
          <div className="mt-6 text-center text-sm">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">SNS 계정으로 로그인</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* 구글 로그인 버튼 */}
              <button
                type="button"
                className="w-full py-3 px-4 text-white bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-md"
                onClick={handleGoogleLogin}
              >
                구글 로그인
              </button>

              {/* 네이버 로그인 버튼 */}
              <button
                type="button"
                className="w-full py-3 px-4 text-white bg-[#03C75A] hover:bg-[#03C75A]/90 rounded-md"
                onClick={handleNaverLogin}
              >
                네이버 로그인
              </button>

              {/* 카카오 로그인 버튼 */}
              <button
                type="button"
                className="w-full py-3 px-4 text-white bg-[#FEE500] text-black hover:bg-[#FEE500]/90 rounded-md"
                onClick={handleKakaoLogin}
              >
                카카오 로그인
              </button>
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="mt-6 text-center text-sm">
            <span
              className="text-gray-900 hover:text-orange-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </span>
            <span className="mx-2 text-gray-400">|</span>
            <span
              className="text-gray-900 hover:text-orange-500 cursor-pointer"
              onClick={() => navigate("/find-id")}
            >
              아이디 찾기
            </span>
            <span className="mx-2 text-gray-400">|</span>
            <span
              className="text-gray-900 hover:text-orange-500 cursor-pointer"
              onClick={() => navigate("/find-pw")}
            >
              비밀번호 찾기
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
