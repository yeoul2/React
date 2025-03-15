import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // API 호출을 위한 axios 추가
import axiosInstance from "../../services/axiosInstance";

const Header = ({ resetSearch }) => {
  // ✅ resetSearch props 추가
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅 사용


  

  // ✅ 로그인 상태 및 사용자 아이디를 관리하는 state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [user_id, setUser_id] = useState(""); // 로그인한 사용자 ID

  // ✅ 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      console.log("🔍 현재 저장된 JWT 토큰:", accessToken);
      console.log("🔍 현재 저장된 REFRESH 토큰:", refreshToken);

      //if (!accessToken && !googleAccessToken) {
      if (!accessToken) {
        console.log("❌ 토큰 없음");
        setIsLoggedIn(false);
        setUser_id("");
        return;
      }

      try {
        //const tokenToUse = accessToken
        const tokenToUse = localStorage.getItem("accessToken");

        console.log("🔥 저장된 accessToken:", tokenToUse);

        if (!tokenToUse) {
          console.warn("❌ accessToken이 없습니다.");
          setIsLoggedIn(false);
          setUser_id("");
          return;
        }

        //axiosInstance 사용 (Authorization 헤더 자동 추가됨)
        //const response = await axiosInstance.get("/api/check")/* , { */
        const response = await axiosInstance.get("/api/check"); /* , { */

        /* headers: {
                    'Authorization': `Bearer ${tokenToUse}`,
                    'Content-Type': 'application/json',
                }, */
        //withCredentials: true,
        /* }); */

        console.log("로그인 확인 응답:", response.data);
        console.log("📌 check 값 확인:", response.data.check); // 🔥 check 값이 실제로 있는지 확인
        //console.log("tokenToUse :" +tokenToUse)

        if (response.data.isAuthenticated && response.data.userId) {
          setIsLoggedIn(true);
          setUser_id(response.data.userId);
        } else {
          setIsLoggedIn(false);
          setUser_id("");
        }
      } catch (error) {
        console.error("로그인 확인 오류:", error);

        // 🔍 401 Unauthorized 에러 처리
        if (error.response) {
          console.error("🔍 서버 응답 코드:", error.response.status);
          console.error("🔍 서버 응답 메시지:", error.response.data);
        }

        setIsLoggedIn(false);
        setUser_id("");
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
      console.log("✅ 로그아웃 성공");
    } catch (error) {
      console.error("❌ 로그아웃 오류:", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("check");
    localStorage.removeItem("user_email");
    localStorage.removeItem("provider");

    window.dispatchEvent(new Event("storage"));

    setIsLoggedIn(false);
    setUser_id("");
    navigate("/"); 
  };


  return (
    <header className="bg-white shadow-sm fixed w-full z-50 top-0 left-0 h-16">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ✅ 왼쪽 - 로고 클릭 시 홈으로 이동 & 검색어 초기화 */}
          <img
            className="h-14 w-auto cursor-pointer"
            src="/images/Yeoul_Logo.png"
            alt="로고"
            onClick={() => {
              resetSearch(); // ✅ props로 전달된 함수 실행 (검색어 초기화)
              navigate("/"); // 메인 페이지 이동
            }}
          />

          {/* ✅ 중앙 - 네비게이션 메뉴 */}
          <div className="flex space-x-8 text-gray-700 font-medium text-lg">
            <span
              className="cursor-pointer hover:text-orange-500 transition-all flex items-center gap-2"
              onClick={() => navigate("/course")}
            >
              <img
                src="/images/capybara_icon.png"
                alt="여울 아이콘"
                className="h-6 w-6"
              />
              여울! 코스 생성
            </span>

            <span
              className="cursor-pointer hover:text-orange-500 transition-all flex items-center gap-2"
              onClick={() => navigate("/board")}
            >
              <img
                src="/images/capybara_icon.png"
                alt="여울 아이콘"
                className="h-6 w-6"
              />
              여울! 코스 후기
            </span>

            <span
              className="cursor-pointer hover:text-orange-500 transition-all flex items-center gap-2"
              onClick={() => navigate("/course_list")}
            >
              <img
                src="/images/capybara_icon.png"
                alt="여울 아이콘"
                className="h-6 w-6"
              />
              여울! 코스 공유
            </span>
          </div>

          {/* ✅ 오른쪽 - 로그인 상태에 따라 다른 UI 렌더링 */}
          <div className="flex items-center space-x-4 min-w-[160px]">
            {isLoggedIn && user_id ? (
              // ✅ 로그인 상태일 경우 (아이디 & 로그아웃 버튼 표시)
              <>
                <span
                  onClick={() => navigate("/mypage-check")}
                  className="text-gray-600 hover:text-orange-500 cursor-pointer flex items-center gap-2"
                >
                  <img
                    src="/images/capybara_face.png"
                    alt="여울 얼굴"
                    className="h-6 w-6"
                  />
                  {user_id}님 {/* 로그인한 사용자 ID 표시 */}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-orange-500 text-white px-4 py-2 text-sm transition-transform transform hover:scale-105"
                >
                  로그아웃
                </button>
              </>
            ) : (
              // ✅ 로그아웃 상태일 경우 (로그인 & 회원가입 버튼 표시)
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-md text-gray-600 hover:text-orange-500 px-3 py-2 text-sm transition-transform transform hover:scale-105"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-md bg-orange-500 text-white px-4 py-2 text-sm transition-transform transform hover:scale-105"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
