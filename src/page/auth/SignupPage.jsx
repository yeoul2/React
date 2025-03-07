import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa"; // 📌 눈 아이콘 & 달력 아이콘 추가

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    agreeTerms: false,
  });

  // 비밀번호 가시성 토글 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 오류 메시지
  const [passwordStrength, setPasswordStrength] = useState(""); // 비밀번호 강도
  const [birthDateFocus, setBirthDateFocus] = useState(false); // 포커스 여부 상태 관리
  const [birthDateError, setBirthDateError] = useState(""); // 생년월일 오류 메시지 상태

  // 📌 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleBirthDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // 숫자만 입력 가능

    if (value.length > 8) return; // 최대 8자리 제한

    setFormData({ ...formData, birthDate: value });
    setBirthDateError(""); // 입력할 때 오류 메시지 초기화
  };

  const handleBirthDateBlur = () => {
    let { birthDate } = formData;
    let value = birthDate.replace(/\D/g, ""); // 숫자만 유지

    if (value.length !== 8) {
      setBirthDateError("생년월일을 확인하세요.");
      return;
    }

    let year = parseInt(value.slice(0, 4), 10);
    let month = parseInt(value.slice(4, 6), 10);
    let day = parseInt(value.slice(6, 8), 10);
    let currentYear = new Date().getFullYear();

    let errorMessage = "";

    if (year > currentYear) {
      errorMessage = `년도는 ${currentYear}년까지 입력 가능합니다.`;
    } else if (month < 1 || month > 12) {
      errorMessage = "월은 01~12 사이의 숫자만 입력 가능합니다.";
    } else if (day < 1 || day > 31) {
      errorMessage = "일은 01~31 사이의 숫자만 입력 가능합니다.";
    }

    if (errorMessage) {
      setBirthDateError(errorMessage);
      return;
    }

    let formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setFormData({ ...formData, birthDate: formattedDate });
    setBirthDateError(""); // 오류 메시지 제거
    setBirthDateFocus(false); // 포커스 해제 시 스타일 원래대로
  };

  // 📌 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 16;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!lengthValid || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setPasswordError("비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.");
    } else {
      setPasswordError("");
    }

    setPasswordStrength(getPasswordStrength(password, lengthValid, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar));
  };

  // 비밀번호 강도 평가
  const getPasswordStrength = (password, lengthValid, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar) => {
    if (password.length === 0) return null;

    let score = 0;
    if (lengthValid) score++;
    if (hasUpperCase && hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    if (score === 0) return { text: "사용불가", color: "bg-red-200 text-red-600" };
    if (score === 1) return { text: "위험", color: "bg-red-200 text-red-600" };
    if (score === 2) return { text: "보통", color: "bg-yellow-200 text-yellow-600" };
    return { text: "안전", color: "bg-green-200 text-green-600" };
  };

  const handleEmailVerification = async () => {
    if (!formData.email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:7007/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`이메일 인증 실패: ${data.message || "오류 발생"}`);
        return;
      }

      alert("이메일 인증 코드가 발송되었습니다. 메일함을 확인해주세요!");

    } catch (error) {
      console.error("이메일 인증 오류:", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleCheckUsername = async () => {
    if (!formData.username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:7007/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`아이디 중복 확인 실패: ${data.message || "오류 발생"}`);
        return;
      }

      if (data.isAvailable) {
        alert("사용 가능한 아이디입니다.");
      } else {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 선택해주세요.");
      }

    } catch (error) {
      console.error("아이디 중복 확인 오류:", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 회원가입 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) {
      alert("비밀번호를 올바르게 입력하세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!formData.agreeTerms) {
      alert("개인정보 수집 및 이용에 동의해야 합니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:7007/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`회원가입 실패: ${data.message || "알 수 없는 오류 발생"}`);
        return;
      }

      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex justify-center items-center px-4"
      style={{ backgroundImage: "url('/images/korea_sig.jpg')" }}>
      <div className="max-w-md w-full bg-white py-8 px-6 shadow-sm rounded-lg">
        <div className="text-center">
          <img
            src="/images/Yeoul_Logo.png"
            alt="로고"
            className="h-14 mx-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">회원가입</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength="10" // 최대 16자 제한
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-1-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="이름을 입력해주세요"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <div className="mt-1 flex">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 block w-full border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="이메일을 입력해주세요"
              />
              <button
                type="button"
                onClick={handleEmailVerification}
                className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-r-md"
              >
                인증하기
              </button>
            </div>
          </div>

          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디</label>
            <div className="mt-1 flex">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                maxLength="12" // 최대 12자 제한
                required
                className="flex-1 block w-full border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="아이디를 입력해주세요"
              />
              <button
                type="button"
                onClick={handleCheckUsername}
                className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-r-md "
              >
                중복확인
              </button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                maxLength="16" // 최대 16자 제한
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-16"
                placeholder="비밀번호 입력"
              />

              {/* 비밀번호 강도 표시 */}
              {passwordStrength && (
                <span
                  className={`absolute top-1/2 right-10 transform -translate-y-1/2 flex items-center justify-center min-w-[40px] px-2 h-5 text-[10px] font-semibold leading-none rounded-full ${passwordStrength.color}`}
                >
                  {passwordStrength.text}
                </span>
              )}

              {/* 비밀번호 가시성 토글 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 px-2 flex items-center text-gray-500"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {/* 비밀번호 조건 미충족 시 오류 메시지 */}
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                maxLength="16" // 최대 16자 제한
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                placeholder="비밀번호를 다시 입력해주세요."
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 px-2 flex items-center text-gray-500"
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">생년월일 (선택 사항)</label>
            <div className="relative">

              {/* 달력 아이콘 색상 변경 (정상: 주황색, 오류: 빨간색) */}
              <FaCalendarAlt
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${birthDateError ? "text-red-500" : birthDateFocus ? "text-orange-500" : "text-gray-400"}`}
              />

              {/* 입력 필드 */}
              <input
                type="text"
                max="9999-12-31"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleBirthDateChange} // ✅ 입력할 때는 숫자만 유지
                onBlur={handleBirthDateBlur} // ✅ 포커스 해제 시 YYYY-MM-DD 형식 적용
                onFocus={() => setBirthDateFocus(true)} // ✅ 포커스 시 스타일 변경
                className={`block w-full pl-10 py-2 border-2 rounded-md shadow-sm transition-colors sm:text-sm
                  ${birthDateError
                    ? "border-red-500 text-red-500 focus:ring-red-500 focus:border-red-500"  // 오류 발생 시
                    : birthDateFocus
                      ? "border-orange-500 focus:ring-orange-500 focus:border-orange-500"  // 포커스 시
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500" // 기본 상태
                  }`}
                placeholder="생년월일 8자리"
                maxLength="10"
              />
            </div>
            {birthDateError && <p className="text-red-500 text-xs mt-1">{birthDateError}</p>}
          </div>

          {/* 개인정보 동의 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="hidden peer" // 기본 체크박스 숨기기
            />
            <label
              htmlFor="agreeTerms"
              className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded-md 
              peer-checked:bg-orange-500 peer-checked:border-orange-500"
            >
              {formData.agreeTerms && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </label>
            <span className="text-sm text-gray-700">개인정보 수집 및 이용에 동의합니다.</span>
          </div>

          {/* 가입 버튼 */}
          <button type="submit" className="w-full py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md">
            가입하기
          </button>

        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <Link to="/login" className="font-medium text-custom hover:text-orange-500">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
