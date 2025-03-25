import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaPencilAlt, FaRocket, FaShareAlt, FaShareSquare, FaTrashAlt } from "react-icons/fa";
import { deleteCourse, getCourseByUserId, shareCourse } from "../../services/courseLogic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faHandsClapping } from "@fortawesome/free-solid-svg-icons";

// 코스 공유 성공시 나타나는 모달 컴포넌트
const ShareSuccessModal = ({ onClose }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const [remainingSeconds, setRemainingSeconds] = useState(5);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigate("/course_list");
    }, 5000);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [navigate]);

  const handleReturn = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    onClose();
    navigate("/course_list");
  };

  const handleClose = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-96 max-w-md border border-gray-200 relative">
        <div className="absolute top-3 right-3">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="flex items-center justify-center">
          <FaShareAlt className="text-3xl text-orange-500 mr-2 mb-2" />
          <h3 className="text-2xl font-extrabold text-gray-900"> 코스 공유 성공!</h3>
        </div>
        <p className="text-gray-700 mt-4 text-base">
          <span className="text-orange-500 text-lg font-bold">{remainingSeconds}</span>초 후에<br />코스 공유 게시판으로 이동합니다.
        </p>
        <div className="mt-6 flex flex-col space-y-4">
          <button onClick={handleReturn} className="justify-center items-center flex px-5 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:bg-orange-600 transition w-full text-lg">
            <FaRocket className="mt-1 mr-2" />
            지금 이동하기
          </button>
          <button onClick={handleClose} className="flex justify-center items-center px-5 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-400 transition w-full text-lg">
            <FaArrowLeft className="mt-1 mr-2" />
            마이페이지 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};



const MyPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]); // user코스 받아올 상태 추가
  const [courseDeleted, setCourseDeleted] = useState(0); // 코스 삭제 시 상태 업데이트
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 모달 표시 여부 상태 추가
  const [showShareModal, setShowShareModal] = useState(false); // 공유하기 성공 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제하기 모달

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
  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // user_id 로 코스 조회하기
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const courseData = await getCourseByUserId(user_id); // API 호출
        setCourses(courseData); // 상태 업데이트
        //setCourses(courseData || []); // 상태 업데이트
        console.log(courseData + "에러나는 구간")
      } catch (error) {
        console.error("코스 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchCourses();
  }, [courseDeleted]); // 마운트 시 한 번 실행

  // 코스 공유하기
  const handleCourseShare = async (cs_no) => {
    console.log("handleCourseShare호출 완료", cs_no);
    try {
      const response = await shareCourse(cs_no); // API 호출
      console.log(response);
      if (response == 1) {
        // 조건 만족 시 모달 표시
        setShowShareModal(true);
      }
      else {
        console.log("공유 실패" + response);
      }
    } catch (error) {
      console.error("코스 공유 실패: ", error);
    }
  };

  // 삭제 버튼 클릭 시 모달 열기
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // 코스 삭제하기
  const handleCourseDelete = async (cs_no) => {
    console.log("handleCourseDelete 호출 완료", cs_no);
    try {
      const response = await deleteCourse(cs_no); // API 호출
      console.log(response);
      if (response == 1) {
        // 조건 만족 시 코스 목록 갱신
        setCourseDeleted(cs_no);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("코스 삭제 실패: ", error);
    }
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
          //type="password"
          type={showPassword[name] ? "text" : "password"} // 👀 눈 상태에 따라 변경
          name={name}
          value={userPw[name]} // 상태 연결
          onChange={name === "new_pw" ? handlevalidateChange : handlePwChange} // ✅ 새 비밀번호만 유효성 검사 실행
          maxLength={16} // ✅ 비밀번호 최대 길이 제한
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3"
        />
         {/* 👁 눈 아이콘 (현재 비밀번호 제외하고 표시) */}
    {name !== "current_pw" && (
      <button
        type="button"
        onClick={() => togglePassword(name)}
        className="absolute right-3 top-8 text-gray-500"
      >
        <FontAwesomeIcon icon={showPassword[name] ? faEye : faEyeSlash} />
      </button>
    )}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">저장된 여행 코스</h2>
              <span className="text-sm text-gray-500">{courses.length}/5 코스</span>
            </div>

            {/* 여행 코스 목록 */}
            {courses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{course.cs_name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{course.cs_country} {course.cs_city}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {course.cs_departure_date}~{course.cs_return_date}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-700"
                    onClick={() => handleOpenDeleteModal()}>
                    <FaTrashAlt />
                  </button>
                  {/* 삭제 확인 모달 */}
                  {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
                        <h3 className="text-lg font-semibold text-gray-900">정말 삭제하시겠습니까?</h3>
                        <p className="text-gray-500 text-sm mt-2">이 작업은 되돌릴 수 없습니다.</p>
                        <div className="mt-4 flex justify-center space-x-4">
                          <button
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            취소
                          </button>
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => handleCourseDelete(course.cs_no)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button className="text-orange-500 border border-orange-500 px-3 py-1.5 text-sm font-medium rounded-md"
                    onClick={() => {
                      console.log("후기 작성 버튼 클릭", course.cs_no);
                      navigate(`/write/${course.cs_no}`)
                    }}>
                    <FaPencilAlt className="mr-1 inline" /> 후기 작성
                  </button>
                  <button className="text-orange-500 border border-orange-500 px-3 py-1.5 text-sm font-medium rounded-md"
                    onClick={() => {
                      console.log("공유 버튼 클릭", course.cs_no);
                      handleCourseShare(course.cs_no)
                    }}>
                    <FaShareAlt className="mr-1 inline" /> 공유하기
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

      {/* 공유 성공 모달 표시 */}
      {showShareModal && <ShareSuccessModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};

export default MyPage;
