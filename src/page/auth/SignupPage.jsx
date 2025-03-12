import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa"; // 📌 눈 아이콘 & 달력 아이콘 추가

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_id: "",
    user_pw: "",
    confirmPassword: "",
    user_birth: "",
    agreeTerms: false,
  });

  // 이메일 제공 업체 선택 사항
  const [provider, setProvider] = useState("gmail"); // 기본값 Gmail

  // 비밀번호 가시성 토글 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 오류 메시지
  const [passwordStrength, setPasswordStrength] = useState(""); // 비밀번호 강도
  const [birthDateFocus, setBirthDateFocus] = useState(false); // 포커스 여부 상태 관리
  const [birthDateError, setBirthDateError] = useState(""); // 생년월일 오류 메시지 상태

  // 이메일 인증 관련 상태 추가
  const [verificationCode, setVerificationCode] = useState(""); // 사용자가 입력할 인증 코드
  const [emailVerified, setEmailVerified] = useState(false); // 이메일 인증 성공 여부
  const [showVerificationInput, setShowVerificationInput] = useState(false); // 인증 코드 입력 필드 표시 여부
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false); // 인증번호 입력 가능 여부


  // 📌 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });

    // 사용자가 비번을 지웠을 경우에도 강도 검사 실행
    if (name === "user_pw" || value.length === 0) {
      validatePassword(value);
    }
  };


  const handleBirthDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // 숫자만 입력 가능

    if (value.length > 8) return; // 최대 8자리 제한

    setFormData({ ...formData, user_birth: value });
    setBirthDateError(""); // 입력할 때 오류 메시지 초기화
  };

  const handleBirthDateBlur = () => {
    let { user_birth } = formData;
    let value = user_birth.replace(/\D/g, ""); // 숫자만 유지

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

    setFormData({ ...formData, user_birth: formattedDate });
    setBirthDateError(""); // 오류 메시지 제거
    setBirthDateFocus(false); // 포커스 해제 시 스타일 원래대로
  };

  // 📌 비밀번호 유효성 검사
  const validatePassword = (user_pw) => {
    const lengthValid = user_pw.length >= 8 && user_pw.length <= 16;
    const hasUpperCase = /[A-Z]/.test(user_pw);
    const hasLowerCase = /[a-z]/.test(user_pw);
    const hasNumber = /\d/.test(user_pw);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(user_pw);

    if (!lengthValid || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setPasswordError("비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.");
    } else {
      setPasswordError("");
    }

    setPasswordStrength(getPasswordStrength(user_pw, lengthValid, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar));
  };

  // 비밀번호 강도 평가
  const getPasswordStrength = (user_pw, lengthValid, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar) => {
    if (user_pw.length === 0) return null;

    let score = 0;
    if (lengthValid) score++;
    //score === 0과 score === 1이 동일한 "위험" 상태라서 차이가 없음.
    if(hasUpperCase) score++;
    if(hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    if (score === 0) return { text: "사용불가", color: "bg-red-200 text-red-600" };
    if (score === 1) return { text: "위험", color: "bg-red-200 text-red-600" };
    if (score === 2) return { text: "보통", color: "bg-yellow-200 text-yellow-600" };
    return { text: "안전", color: "bg-green-200 text-green-600" };
  };

  // 이메일 인증 요청
  const handleEmailVerification = async () => {
    if (!formData.user_email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!provider) {  // ✅ provider 값이 있는지 체크
      alert("이메일 제공업체를 선택해주세요.");
      return;
  }

    try {
      console.log("📩 인증 요청: ", { user_email: formData.user_email, provider }); // ✅ 콘솔 확인
      //const response = await fetch("http://localhost:7007/api/verify-email", {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: formData.user_email, provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`이메일 인증 실패: ${data.message || "오류 발생"}`);
        return;
      }
      alert("이메일 인증 코드가 발송되었습니다.");
      setShowVerificationInput(true); // 인증 코드 입력 필드 표시
      setIsVerificationEnabled(true); // 인증번호 입력 가능하게 활성화

      } catch (error) {
      console.error("이메일 인증 오류:", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 이메일 인증 확인
  const handleVerificationCheck = async () => {
    if (!formData.user_email || !verificationCode) {
        alert("이메일과 인증 코드를 입력해주세요.");
        return;
    }

    try {
        console.log("🔍 인증 코드 확인 요청:", { 
            user_email: formData.user_email, 
            code: verificationCode 
        });

        const response = await fetch("/api/check-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_email: formData.user_email,  // ✅ 이메일
                code: verificationCode  // ✅ 사용자가 입력한 인증 코드
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`인증 실패: ${data.message || "오류 발생"}`);
            return;
        }

        alert("인증 성공! 회원가입을 진행해주세요.");
        setEmailVerified(true);  // 인증 상태 업데이트

    } catch (error) {
        console.error("인증 확인 오류:", error);
        alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
};


  const handleCheckUsername = async () => {
    if (!formData.user_id) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      //const response = await fetch("http://localhost:7007/api/check-username", {
      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: formData.user_id }),
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

    if (!emailVerified) {
      alert("이메일 인증을 완료해야 회원가입이 가능합니다.");
      return;
    }
  
    if (passwordError) {
      alert("비밀번호를 올바르게 입력하세요.");
      return;
    }
  
    if (formData.user_pw !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
  
    if (!formData.agreeTerms) {
      alert("개인정보 수집 및 이용에 동의해야 합니다.");
      return;
    }

    // role 기본 USER로 설정
    const requestData = {
      ...formData,
      role: "USER" //백엔드에서 필요한 role 값
    }

    // 생년월일을 안넣을수도 있다는 가정하에 작성
    if (!requestData.user_birth) {
      delete requestData.user_birth; // 빈 값이면 제거
  }

      // 서버로 보낼 때마다 `confirmPassword` 제거
      const {confirmPassword, ...singupData} = formData

    try {
      //const response = await fetch("http://localhost:7007/api/signup", {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singupData), // `confirmPassword` 없이 전송
      });

      let data;
          try {
            data = await response.json(); // ✅ JSON 형식 응답이면 정상 처리
          } catch (error) {
            const text = await response.text(); // ❗ JSON이 아닐 경우, 문자열로 처리
            alert(text); // 🚨 "회원가입이 성공적으로 완료되었습니다." 같은 문자열도 정상 출력
  return;
  }
      alert(data.message); // ✅ JSON 응답이면 정상 출력
      //const data = await response.json(); 수정으로 인해 잠시 주석처리

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
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              maxLength="10" // 최대 16자 제한
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-1-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="이름을 입력해주세요"
            />
          </div>

   {/* 이메일 제공업체 선택 */}
   <div>
            <label className="block text-sm font-medium text-gray-700">이메일 제공업체</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              <option value="gmail">Gmail</option>
              <option value="naver">Naver</option>
            </select>
          </div>

          {/* 이메일 입력 필드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <div className="mt-1 flex">
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
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
                인증 코드 받기
              </button>
            </div>
          </div>

          {/* 이메일 인증 코드 입력 필드 */}
          {showVerificationInput && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">인증 코드</label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  disabled={!isVerificationEnabled} 
                  className="flex-1 block w-full border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="인증 코드를 입력해주세요"
                />
                <button
                  type="button"
                  onClick={handleVerificationCheck}
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-r-md"
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디</label>
            <div className="mt-1 flex">
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
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
                name="user_pw"
                value={formData.user_pw}
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
                name="user_birth"
                value={formData.user_birth}
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
