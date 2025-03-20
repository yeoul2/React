import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가

const MypageCheck = () => {
  const [user_pw, setUser_pw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 useNavigate 사용

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📩 [비밀번호 확인 요청] 입력된 비밀번호:", user_pw);

    if (user_pw.length < 8) {
      alert("비밀번호는 최소 8자 이상 입력해야 합니다.");
      return;
    }
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken"); // ✅ 로컬스토리지에서 JWT 가져오기
      console.log("🔑 [JWT 토큰 확인]:", accessToken);

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        navigate("/login"); // ✅ 로그인 페이지로 이동
        return;
      }

      console.log("🚀 [API 요청] /api/check-password로 POST 요청 시작");

      const response = await fetch("/api/check-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // ✅ JWT 토큰을 헤더에 포함
        },
        body: JSON.stringify({ user_pw }),
      });

      console.log("📩 [서버 응답 수신]", response);

      const data = await response.json();
      console.log("📨 [서버 응답 데이터]", data);

      if (response.ok && data.success) {
        alert("비밀번호 확인 완료! 마이페이지로 이동합니다.");
        navigate("/mypage"); // ✅ 마이페이지로 이동
      } else {
        alert(data.message || "비밀번호가 틀렸습니다. 다시 입력해주세요.");
        setUser_pw(""); // 입력값 초기화
      }
    } catch (error) {
      console.error("Error:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">마이페이지 접근</h2>
            <p className="text-sm text-gray-600">보안을 위해 비밀번호를 한번 더 입력해주세요.</p>
          </div>

          {/* 비밀번호 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-md shadow-sm">
              <div className="relative">
                <label htmlFor="password" className="sr-only">비밀번호</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="user_pw"
                  type="password"
                  required
                  value={user_pw}
                  onChange={(e) => setUser_pw(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 비밀번호 조건 안내 */}
            <div className="text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>영문, 숫자, 특수문자 조합 8-20자</li>
                <li>연속된 숫자나 아이디와 동일한 비밀번호는 사용할 수 없습니다</li>
              </ul>
            </div>

            {/* 확인 버튼 */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-md"
                disabled={loading}
              >
                {loading ? "확인 중..." : "확인"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MypageCheck;
