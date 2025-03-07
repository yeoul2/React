import React, { useState } from "react";

const MypageCheck = () => {
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("비밀번호는 최소 8자 이상 입력해야 합니다.");
      return;
    }

    setLoading(true); // 로딩 시작

    try {
      const response = await fetch("http://localhost:8080/api/check-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }), // 비밀번호 JSON 데이터 전송
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          alert("비밀번호 확인 완료! 마이페이지로 이동합니다.");
          window.location.href = "/mypage"; // 마이페이지 이동
        } else {
          alert("비밀번호가 틀렸습니다. 다시 입력해주세요.");
          setPassword(""); // 입력값 초기화
        }
      } else {
        alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
                  alt="로고"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">마이페이지 접근</h2>
            <p className="text-sm text-gray-600">
              보안을 위해 비밀번호를 한번 더 입력해주세요.
            </p>
          </div>

          {/* 비밀번호 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-md shadow-sm">
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
