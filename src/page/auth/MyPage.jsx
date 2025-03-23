import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaPencilAlt, FaRocket, FaShareAlt, FaShareSquare, FaTrashAlt } from "react-icons/fa";
import { deleteCourse, getCourseByUserId, shareCourse } from "../../services/courseLogic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandsClapping } from "@fortawesome/free-solid-svg-icons";

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

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
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
      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8">
          {/* 프로필 정보 */}
          <section className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-6">프로필 정보</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">이름</p>
                  <p className="text-sm text-gray-900">김여행</p>
                </div>
                <button className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md">
                  수정
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">아이디</p>
                <p className="text-sm text-gray-900">travel_kim</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">이메일</p>
                  <p className="text-sm text-gray-900">travel_kim@example.com</p>
                </div>
                <button className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md">
                  수정
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">생년월일</p>
                  <p className="text-sm text-gray-900">1999-05-15</p>
                </div>
                <button className="text-orange-500 border border-orange-500 px-4 py-2 text-sm font-medium rounded-md">
                  수정
                </button>
              </div>
            </div>
          </section>

          {/* 비밀번호 변경 */}
          <section className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-6">비밀번호 변경</h2>
            <form className="space-y-4">
              {["current", "new", "confirm"].map((field, index) => (
                <div key={index} className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "current" ? "현재 비밀번호" : field === "new" ? "새 비밀번호" : "새 비밀번호 확인"}
                  </label>
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    name={field}
                    value={passwords[field]}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePassword(field)}
                  >
                    {showPassword[field] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              ))}
              <div className="flex justify-end">
                <button className="bg-orange-500 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-orange-600">
                  변경하기
                </button>
              </div>
            </form>
          </section>

          {/* 저장된 여행 코스 */}
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

        {/* 회원 탈퇴 버튼 */}
        <div className="flex justify-end mt-4">
          <button className="text-red-600 border border-red-600 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50">
            회원 탈퇴
          </button>
        </div>
      </main>

      {/* 공유 성공 모달 표시 */}
      {showShareModal && <ShareSuccessModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};

export default MyPage;
