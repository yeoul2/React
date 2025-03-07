import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NaverCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNaverToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");


      if (code && state) {
        try {
          // 백엔드에 인증 코드와 상태 전달
          const response = await axios.post(
            "/auth/naver/callback",
            { code, state },
          );

          console.log("네이버 로그인 성공:", response.data);
          // 로그인 성공 시 메인 페이지로 리다이렉트
          navigate("/");
        } catch (error) {
          console.error("네이버 로그인 실패:", error);
          // 로그인 실패 시 로그인 페이지로 리다이렉트
          navigate("/login");
        }
      } else {
        console.error("Authorization code or state not found");
        navigate("/login");
      }
    };

    fetchNaverToken();
  }, [navigate]);

  return <div>네이버 로그인 처리 중...</div>;
};

export default NaverCallback;
