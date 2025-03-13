// 일단 대기

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // 현재 url에 쿼리스트링을 가져옴 -> url의 쿼리 파라미터를 파싱
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        const provider = urlParams.get("provider"); // 🔥 provider 추가

        console.log("✅ 받은 AccessToken:", accessToken);
        console.log("✅ 받은 RefreshToken:", refreshToken);
        console.log("✅ 로그인 제공자:", provider); // 구글 또는 네이버 확인

        // accessToken이 있다면 localStorage에 저장함
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("provider", provider || "unknown")
            //storage 이벤트를 발생시켜 다른 컴포넌트에서도 토큰 변경을 감지할 수 있도록 한다.
            // 예를 들어 useEffect에서 storage를 감지하면 자동 로그인 상태가 업데이트 됨
            window.dispatchEvent(new Event("storage"));

            alert("Google 로그인 성공!");
            navigate("/"); // home으로 이동

            // 로그인 실패시 처리 부분
        } else {
            console.error("❌ Google 로그인 실패: accessToken이 없음");
            alert("로그인에 실패했습니다.");
            navigate("/login"); // 로그인페이지로 이동
        }
    }, [navigate]);

    return <h2>Google 로그인 처리 중...</h2>;
};

export default GoogleAuthCallback;
