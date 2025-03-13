import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'

const NaverAuthCallback = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        const provider = urlParams.get("provider"); // 🔥 provider 추가


        console.log("✅ 받은 AccessToken:", accessToken);
        console.log("✅ 받은 RefreshToken:", refreshToken);
        console.log("✅ 로그인 제공자:", provider); // 구글 또는 네이버 확인


        if(accessToken){
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", refreshToken)
            localStorage.setItem("provider", provider || "unknown")

            console.log("✅ 저장된 accessToken:", localStorage.getItem("accessToken"));
            console.log("✅ 저장된 refreshToken:", localStorage.getItem("refreshToken"));

            window.dispatchEvent(new Event("storage"))

            alert("Naver 로그인 성공!");
            navigate("/"); // home으로 이동
        }else {
            console.log("❌ Naver 로그인 실패: accessToken이 없음")
            alert("로그인에 실패했습니다.")
            navigate("/login")
        }
    },[navigate])
  return <h2>Naver 로그인 처리 중...</h2>
}

export default NaverAuthCallback