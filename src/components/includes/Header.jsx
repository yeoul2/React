import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // API 호출을 위한 axios 추가

const Header = ({ resetSearch }) => {
  const navigate = useNavigate(); // 네비게이션 훅 사용
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [userId, setUserId] = useState(""); // 로그인한 사용자 아이디

  // 로그인 상태 확인 (백엔드 API 호출)
  useEffect(() => {
    axios.get("/api/auth/check", { withCredentials: true }) // 쿠키 기반 로그인 확인
      .then((response) => {
        if (response.data.isAuthenticated) {
          setIsLoggedIn(true);
          setUserId(response.data.userId);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserId("");
      });
  }, []);

  // 로그아웃 기능 (백엔드 요청)
  const handleLogout = () => {
    axios.post("/api/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(false);
        setUserId("");
        navigate("/");
      })
      .catch((error) => console.error("로그아웃 오류:", error));
  };

  return (
    <header className="bg-white shadow-sm fixed w-full z-50 top-0 left-0 h-16">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 왼쪽 - 로고 */}
          <img
            className="h-14 w-auto cursor-pointer"
            src="/images/Yeoul_Logo.png"
            alt="로고"
            onClick={() => {
              resetSearch(); // ✅ 검색어 초기화
              navigate("/");
            }}
          />

          {/* 중앙 - 네비게이션 메뉴 */}
          <div className="flex space-x-8 text-gray-700 font-medium text-lg">
            <span
              className="cursor-pointer hover:text-custom"
              onClick={() => navigate("/course")}
            >
              코스추천
            </span>

            <span
              className="cursor-pointer hover:text-custom"
              onClick={() => navigate("/community")}
            >
              코스 후기
            </span>

            <span
              className="cursor-pointer hover:text-custom"
              onClick={() => navigate("/course_list")}
            >
              코스 추천
            </span>
          </div>

          {/* 오른쪽 - 로그인/회원가입 또는 사용자 아이디 및 로그아웃 */}
          <div className="flex items-center space-x-4 min-w-[160px]">
            {isLoggedIn ? (
              // 로그인 상태일 경우
              <>
                <span
                  onClick={() => navigate("/mypage")}
                  className="text-gray-600 hover:text-custom cursor-pointer"
                >
                  {userId}님
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-custom text-white px-4 py-2 text-sm"
                >
                  로그아웃
                </button>
              </>
            ) : (
              // 로그인 상태가 아닐 경우
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-md text-gray-600 hover:text-custom px-3 py-2 text-sm"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-md bg-orange-500 text-white px-4 py-2 text-sm"
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
