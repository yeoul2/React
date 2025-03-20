import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaTrashAlt,
  FaPencilAlt,
  FaShareAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router";

const MyPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // 모달창 추가
  const [passwordError, setPasswordError] = useState("");
  const [userInfo, setUserInfo] = useState({
    user_name: "",
    user_id: "", // ✅ 아이디 추가 (읽기 전용)
    user_email: "",
    user_birth: "",
  });

  const [userPw, setUserpw] = useState({
    current_pw: "", // 현재 비번
    new_pw: "", // 새로운 비번
    confirm_pw: "", // 비번 확인
  });

  const handlePwChange = (e) => {
    setUserpw({ ...userPw, [e.target.name]: e.target.value });
  };

  const [editMode, setEditMode] = useState({
    user_name: false,
    user_email: false,
    user_birth: false,
  });

  // 사용자 정보 가져오기 (GET 요청)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("/api/user-info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserInfo(data);
        } else {
          alert(data.message || "사용자 정보를 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // 입력값 변경 시 상태 업데이트
  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handlevalidateChange = (e) => {
    const { name, value } = e.target;

    // 입력값이 16자를 초과하면 자동으로 자르기
    if (name === "new_pw" && value.length > 16) {
      return; // 입력 방지 (16자 초과 시)
    }

    setUserpw((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "new_pw") {
      setPasswordError(validatePassword(value));
    }
  };

  // 수정 버튼 클릭 시 editMode 토글
  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  // 변경된 정보 저장 (PUT 요청)
  const handleSave = async (field) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ [field]: userInfo[field] }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("사용자 정보가 성공적으로 수정되었습니다.");
        setEditMode({ ...editMode, [field]: false }); // 수정 모드 종료
      } else {
        alert(data.message || "수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 사용자 정보 수정 실패:", error);
    }
  };

  // 변경된 비번 업데이트 (Put 요청)
  const handlePwSave = async () => {
    if (!userPw.current_pw || !userPw.new_pw || !userPw.confirm_pw) {
      alert("모든 필드를 입력해야 합니다.");
      return;
    }

    const passwordErrorMessage = validatePassword(userPw.new_pw);
    if (passwordErrorMessage) {
      alert(passwordErrorMessage);
      return;
    }

    console.log("🔍 비밀번호 변경 요청 데이터:", userPw); // 🛠 디버깅 로그 추가

    if (userPw.new_pw !== userPw.confirm_pw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/update-pw", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_pw: userPw.current_pw, // ✅ 올바르게 전달되는지 확인!
          new_pw: userPw.new_pw,
          confirm_pw: userPw.confirm_pw,
        }),
      });

      const data = await response.json();
      console.log("🔍 서버 응답:", data); // 🛠 서버 응답 로그 추가

      if (response.ok) {
        alert(
          "비밀번호가 성공적으로 변경되었습니다. \n 변경된 정보로 다시 로그인 바랍니다."
        );
        setUserpw({ current_pw: "", new_pw: "", confirm_pw: "" });
        navigate("/login");
      } else {
        alert(data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 비밀번호 변경 실패:", error);
    }
  };

  const handleDelete = async () => {
    if (!userPw.current_pw) {
      alert("비밀번호를 입력해야 탈퇴할 수 있습니다.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("api/delete-info", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ current_pw: userPw.current_pw }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원 탈퇴가 완료되었습니다.", data);
        localStorage.removeItem("accessToken"); //토큰 삭제
        navigate("/login");
      }
    } catch (error) {
      console.error("회원 탈퇴 실패!:", error);
    }
  };

  // 비밀번호 유효성 추가
  const validatePassword = (user_pw) => {
  if (user_pw.length < 8 || user_pw.length > 16) {
    return "비밀번호는 8~16자로 입력해야 합니다.";
  }
  if (!/[A-Z]/.test(user_pw)) {
    return "비밀번호에 최소 1개의 대문자가 포함되어야 합니다.";
  }
  if (!/[a-z]/.test(user_pw)) {
    return "비밀번호에 최소 1개의 소문자가 포함되어야 합니다.";
  }
  if (!/\d/.test(user_pw)) {
    return "비밀번호에 최소 1개의 숫자가 포함되어야 합니다.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(user_pw)) {
    return "비밀번호에 최소 1개의 특수문자가 포함되어야 합니다.";
  }
  return ""; // ✅ 모든 조건 통과 시 빈 문자열 반환 (유효한 비밀번호)
};

  return (
    <div className="bg-gray-50 font-['Noto Sans KR'] min-h-screen">
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8">
          {/* ✅ 프로필 정보 */}
          <section className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              프로필 정보
            </h2>
            <div className="space-y-6">
              {/* ✅ 아이디 (읽기 전용) */}
              <div>
                <p className="text-sm font-medium text-gray-500">아이디</p>
                <p className="text-sm text-gray-900">{userInfo.user_id}</p>
              </div>

              {/* ✅ 수정 가능한 필드 (이름, 이메일, 생년월일) */}
              {["user_name", "user_email", "user_birth"].map((field, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {field === "user_name"
                        ? "이름"
                        : field === "user_email"
                        ? "이메일"
                        : "생년월일"}
                    </p>
                    {field === "user_email" ? (
                      // ✅ 이메일은 수정 불가능하게 고정
                      <p className="text-sm text-gray-900">{userInfo[field]}</p>
                    ) : editMode[field] ? (
                      <input
                        type={field === "user_birth" ? "date" : "text"}
                        name={field}
                        value={userInfo[field]}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{userInfo[field]}</p>
                    )}
                  </div>
                  {/* ✅ 이메일(user_email)에는 수정 버튼 안 보이게 설정 */}
                  {field !== "user_email" && (
                    <button
                      className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md"
                      onClick={() =>
                        editMode[field]
                          ? handleSave(field)
                          : toggleEditMode(field)
                      }
                    >
                      {editMode[field] ? "저장" : "수정"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ✅ 비밀번호 변경 */}
<section className="bg-white shadow rounded-lg p-5">
  <h2 className="text-lg font-medium text-gray-900 mb-6">
    비밀번호 변경
  </h2>
  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
    {[
      { label: "현재 비밀번호", name: "current_pw" },
      { label: "새 비밀번호", name: "new_pw" },
      { label: "새 비밀번호 확인", name: "confirm_pw" },
    ].map(({ label, name }, index) => (
      <div key={index} className="relative">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type="password"
          name={name}
          value={userPw[name]} // 상태 연결
          onChange={name === "new_pw" ? handlevalidateChange : handlePwChange} // ✅ 새 비밀번호만 유효성 검사 실행
          maxLength={16} // ✅ 비밀번호 최대 길이 제한
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3"
        />
        {/* 유효성 검사 메시지 (새 비밀번호 입력 시) */}
        {name === "new_pw" && passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
      </div>
    ))}
    <div className="flex justify-end">
      <button
        type="submit"
        onClick={handlePwSave} // ✅ 비밀번호 변경 요청 실행
        className="bg-orange-500 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-orange-600"
      >
        변경하기
      </button>
    </div>
  </form>
</section>

          {/* ✅ 저장된 여행 코스 */}
          <section className="bg-white shadow rounded-lg p-5 col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              저장된 여행 코스
            </h2>
            {[
              { title: "제주도 3박 4일 코스" },
              { title: "부산 여행 코스" },
            ].map((trip, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-medium text-gray-900">
                    {trip.title}
                  </h3>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* ✅ 회원 탈퇴 버튼 */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowModal(true)} // 모달창 열기
            className="text-red-600 border border-red-600 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50"
          >
            회원 탈퇴
          </button>
        </div>

        {/* ✅ 회원탈퇴 모달창 */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                ⚠️ 회원 탈퇴
              </h2>
              <p className="text-sm text-gray-600">
                정말로 탈퇴하시겠습니까? <br />
                탈퇴 후에는 계정을 복구할 수 없습니다.
              </p>

              {/* 기존 상태 활용하여 비밀번호 입력 */}
              <input
                type="password"
                name="current_pw" // ✅ 기존 userPw 상태 사용
                placeholder="현재 비밀번호 입력"
                value={userPw.current_pw}
                onChange={handlePwChange} // ✅ 기존 핸들러 사용
                className="mt-4 block w-full border-gray-300 rounded-md py-2 px-3"
              />

              <div className="mt-4 flex justify-between">
                {/* 취소 버튼 */}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  취소
                </button>

                {/* 회원 탈퇴 버튼 */}
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPage;
