import { useState } from "react";

const PasswordChange = () => {
  const [form, setForm] = useState({
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    tempPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  // 입력 필드 변경 핸들러
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // 비밀번호 가시성 토글
  const togglePassword = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/change-pw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempPassword: form.tempPassword, newPassword: form.newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        // TODO: 비밀번호 변경 후 로그인 페이지로 리디렉션 (예: window.location.href = "/login")
      } else {
        alert(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-center text-2xl font-bold text-gray-900">비밀번호 변경</h2>
        <p className="text-center text-sm text-gray-600 mt-2">
          임시 비밀번호로 로그인하여 새로운 비밀번호를 설정해주세요
        </p>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* 임시 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">임시 비밀번호</label>
            <div className="mt-1 relative">
              <input
                type={showPassword.tempPassword ? "text" : "password"}
                name="tempPassword"
                value={form.tempPassword}
                onChange={handleChange}
                required
                placeholder="임시 비밀번호 입력"
                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-custom focus:border-custom sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => togglePassword("tempPassword")}
              >
                <i className={`far ${showPassword.tempPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
              </button>
            </div>
          </div>

          {/* 새 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <div className="mt-1 relative">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                placeholder="새 비밀번호 입력"
                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-custom focus:border-custom sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => togglePassword("newPassword")}
              >
                <i className={`far ${showPassword.newPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">영문, 숫자, 특수문자를 포함한 8-20자</p>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
            <div className="mt-1 relative">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="새 비밀번호 다시 입력"
                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-custom focus:border-custom sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => togglePassword("confirmPassword")}
              >
                <i className={`far ${showPassword.confirmPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400`}></i>
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-custom hover:bg-custom/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom rounded-md"
              disabled={loading}
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
          <p className="text-sm text-center text-gray-500">비밀번호 변경 후 자동으로 로그인 페이지로 이동됩니다</p>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;
