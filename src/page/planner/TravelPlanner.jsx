import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { FaSearch, FaTimes, FaTrashAlt, FaSave } from "react-icons/fa";
import Modal from "react-modal";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import useTravelSearch from "../../components/hooks/useTravelSearch"; // ✅ 커스텀 훅 추가
import { Navigate } from "react-router";
import { v4 as uuidv4 } from 'uuid';


// 📌 모달 스타일 설정
const modalStyles = {
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  content: {
    width: "60%",
    height: "60%",
    margin: "auto",
    padding: "20px",
    borderRadius: "10px",
  },
};

// 📌 지도 크기 설정
const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
};

// 📌 기본 지도 설정 (서울)
const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
  zoom: 12,
};

const PlannerPage = () => {
  const [tripDuration, setTripDuration] = useState(""); // 여행 기간
  const [travelStyle, setTravelStyle] = useState([]); // 여행 스타일 선택
  const [mapCenter, setMapCenter] = useState(defaultCenter); // 지도 중심 좌표
  const [dateRange, setDateRange] = useState([]); // 날짜 선택
  const [country, setCountry] = useState(""); // ✅ 나라 정보 상태 추가
  const [isSaving, setIsSaving] = useState(false); // DB 저장 로딩 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 📌 달력 토글 상태
  const [isPeopleOpen, setIsPeopleOpen] = useState(false); // 📌 인원 선택 드롭다운 상태
  const [adults, setAdults] = useState(2); // 📌 성인 인원 수
  const [plans, setPlans] = useState([]); // 📌 AI가 만든 일정 목록
  const [isLoading, setIsLoading] = useState(false); // ✅ AI가 일정 만드는 로딩 상태 추가
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null); // 📌 현재 보고 있는 일정
  const [selectedComparisons, setSelectedComparisons] = useState([]); // 📌 비교 선택 일정
  const [isModalOpen, setIsModalOpen] = useState(false); // 📌 비교 모달 상태

  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null); // 📌 Flatpickr 인스턴스 저장

  // ✅ 커스텀 훅 사용하여 검색 기능 적용
  const {
    isLoggedIn, // 🔹 로그인 여부 추가
    currentUser, // 🔹 현재 로그인한 사용자 정보 추가
    searchTerm,
    showResults,
    selectedCity,
    recentSearches,
    popularDestinations,
    suggestedCities,
    searchResultsRef,
    setShowResults,
    handleCountryChange,
    handleClearSearch,
    handleCitySelect,
    handleRemoveRecentSearch,
    handlePopularDestinationSelect,
  } = useTravelSearch();

  // 📌 Flatpickr 초기화 및 관리
  useEffect(() => {
    if (datePickerRef.current) {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 기존 인스턴스 제거

      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        locale: "ko",
        mode: "range",
        dateFormat: "Y.m.d",
        minDate: "today",
        disableMobile: true,
        onChange: (selectedDates) => {
          setDateRange(selectedDates);
          if (selectedDates.length === 2) {
            const nights = Math.round((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24));
            setTripDuration(`${nights}박 ${nights + 1}일`);
          }
          setIsDatePickerOpen(false); // 📌 날짜 선택 시 달력 닫기
        },
        onClose: () => setIsDatePickerOpen(false), // 📌 빈 곳 클릭 시 달력 닫기
      });
    }
    return () => {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy();
    };
  }, []);


  // 📌 AI 일정 생성
  const handleGenerateAIPlan = () => {
    if (plans.length >= 5) {
      alert("최대 5개의 일정만 생성할 수 있습니다.");
      return;
    }

    const dummyPlans = [
      {
        id: uuidv4(),
        day: "DAY 1",
        coordinates: [
          { lat: 37.5651, lng: 126.9783 }, // 명동
          { lat: 37.5796, lng: 126.9770 }, // 경복궁
          { lat: 37.5724, lng: 126.9768 }, // 광화문
        ],
        activities: [
          { time: "09:00", title: "🏰 명동 거리", desc: "쇼핑과 길거리 음식 체험" },
          { time: "12:00", title: "🍜 점심 - 명동칼국수", desc: "서울 명동의 대표적인 칼국수 맛집" },
          { time: "14:00", title: "🏛️ 경복궁", desc: "한국의 대표적인 고궁 관람" },
          { time: "17:00", title: "🌆 광화문 광장", desc: "서울의 랜드마크 광화문 방문" },
          { time: "19:00", title: "🍖 저녁 - 삼겹살 맛집", desc: "한국식 바베큐를 즐길 수 있는 곳" },
        ],
      },
      {
        id: uuidv4(),
        day: "DAY 2",
        coordinates: [
          { lat: 37.5512, lng: 126.9882 }, // 남산서울타워
          { lat: 37.5348, lng: 126.9948 }, // 이태원
          { lat: 37.5665, lng: 126.9780 }, // 청계천
        ],
        activities: [
          { time: "08:00", title: "🥐 조식 - 호텔 조식", desc: "호텔에서 아침 식사" },
          { time: "10:00", title: "🗼 남산서울타워", desc: "서울 전경 감상 및 자물쇠 데이트" },
          { time: "12:30", title: "🍛 점심 - 이태원 한식당", desc: "이태원에서 다양한 음식 체험" },
          { time: "15:00", title: "🎨 국립중앙박물관", desc: "한국 역사와 문화를 한눈에" },
          { time: "18:00", title: "🏞️ 청계천 산책", desc: "서울의 도심 속 자연 공간에서 휴식" },
          { time: "20:00", title: "🍺 홍대 밤문화 체험", desc: "라이브 음악과 다양한 펍 탐방" },
        ],
      },
      {
        id: uuidv4(),
        day: "DAY 3",
        coordinates: [
          { lat: 37.5511, lng: 127.0070 }, // 동대문 디자인 플라자
          { lat: 37.5033, lng: 127.0501 }, // 코엑스
          { lat: 37.4853, lng: 127.0216 }, // 가로수길
        ],
        activities: [
          { time: "09:00", title: "☕ 브런치 - 카페 탐방", desc: "인스타 감성 카페에서 아침" },
          { time: "11:00", title: "🎭 동대문 디자인 플라자", desc: "서울의 현대적인 건축 공간" },
          { time: "13:30", title: "🍲 점심 - 코엑스 푸드코트", desc: "다양한 음식 선택 가능" },
          { time: "15:00", title: "📽️ 메가박스 영화 감상", desc: "서울에서 최신 영화 관람" },
          { time: "17:00", title: "🌿 가로수길 쇼핑", desc: "트렌디한 브랜드와 감성 공간 탐방" },
          { time: "20:00", title: "🍷 강남 바에서 칵테일", desc: "강남에서 고급 바 체험" },
        ],
      },
      {
        id: uuidv4(),
        day: "DAY 4",
        coordinates: [
          { lat: 37.4599, lng: 126.9522 }, // 서울대입구
          { lat: 37.4563, lng: 126.9510 }, // 관악산
          { lat: 37.5775, lng: 127.0244 }, // 성수동 카페거리
        ],
        activities: [
          { time: "08:00", title: "🥞 조식 - 브런치 카페", desc: "여유로운 브런치 타임" },
          { time: "10:00", title: "🏔️ 관악산 등산", desc: "서울의 대표적인 등산 코스" },
          { time: "13:00", title: "🍚 점심 - 한식 맛집", desc: "한정식 또는 전통 한식 체험" },
          { time: "15:00", title: "☕ 성수동 카페 탐방", desc: "디자인 감성 카페 방문" },
          { time: "18:00", title: "🍜 저녁 - 유명 라멘집", desc: "서울에서 유명한 일본 라멘 맛집" },
          { time: "20:00", title: "🚕 공항 이동 및 귀국", desc: "여행 종료 및 공항으로 이동" },
        ],
      },
    ];

    let aiPlans = null;
    const finalPlans = aiPlans?.length ? aiPlans : dummyPlans;
    setPlans(prevPlans => {
      const updatedPlans = [
        ...(prevPlans || []),
        ...finalPlans.filter(newPlan => !prevPlans?.some(p => p.id === newPlan.id)),
      ];

      // ✅ 일정 추가 후 첫 번째 일정이 보이도록 설정
      if (updatedPlans.length > 0) {
        setSelectedPlanIndex(updatedPlans.length - 1);
      }

      return updatedPlans;
    });
  };

  // 📌 일정 버튼 클릭 시 해당 일정으로 변경 (체크박스 클릭 시 일정 변경되지 않도록 수정)
  const handleSelectPlan = (planIndex, event) => {
    // ✅ 체크박스 클릭 시 일정 변경 방지
    if (event?.target?.type === "checkbox") {
      return;
    }

    // ✅ 선택된 일정 변경
    setSelectedPlanIndex(planIndex);

    // ✅ 선택된 일정의 첫 번째 DAY의 첫 번째 위치로 지도 이동
    const firstDay = plans[planIndex]?.days?.[0]; // 첫 번째 DAY 가져오기

    if (firstDay && firstDay.coordinates?.length > 0) {
      setMapCenter(firstDay.coordinates[0]); // ✅ 첫 번째 위치로 지도 이동
    }
  };

  // 📌 일정 삭제 함수
  const handleDeletePlan = (id) => {
    if (Array.isArray(plans) && plans.length === 0) {
      alert("삭제할 일정이 없습니다.");
      return;
    }

    const deletedPlanId = plans[selectedPlanIndex].id;

    // ✅ 선택된 일정 삭제
    const updatedPlans = plans.filter((_, index) => index !== selectedPlanIndex);
    setPlans(updatedPlans);

    // ✅ 비교 리스트에서도 삭제된 일정 제거
    setSelectedComparisons((prev) => prev.filter((id) => id !== deletedPlanId));

    // ✅ 삭제 후 selectedPlanIndex 조정
    setSelectedPlanIndex(updatedPlans.length > 0 ? 0 : null);

    // ✅ 로컬스토리지 반영 (로그인된 경우)
    if (isLoggedIn && currentUser?.id) {
      localStorage.setItem(`savedSchedules_${currentUser.id}`, JSON.stringify(updatedPlans));
    }

    return updatedPlans;
  };

  // 📌 일정 비교 선택 토글
  const toggleSelectComparison = (id) => {
    setSelectedComparisons((prev) => {
      if (prev.includes(id)) return prev.filter((planId) => planId !== id);
      if (prev.length < 3) return [...prev, id];
      return prev;
    });
  };

  // 📌 일정 저장 (백엔드 연동)
  const handleSavePlan = async (plan) => {
    if (plans.length === 0) {
      alert("저장할 일정이 없습니다.");
      return;
    }

    try {
      const response = await axios.post("/api/schedule/save", { schedule: plan });
      if (response.status === 200) {
        alert(`${plan.day} 일정이 성공적으로 저장되었습니다!`);
      }
    } catch (error) {
      console.error("일정 저장 실패:", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // 📌 모달 열기 및 닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 py-8 mt-16">
      {/* 📌 AI 추천 일정 생성 버튼 */}
      <div className="text-center mb-6">
        <button
          onClick={handleGenerateAIPlan}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-md"
        >
          AI 추천 일정 생성
        </button>
      </div>

      {/* 📌 일정 선택 및 비교 버튼 */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* 일정 선택 버튼 + 체크박스 (버튼 안에 포함, 체크박스 클릭 시 일정 변경 X) */}
        <div className="flex gap-2">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md w-32 justify-between ${selectedPlanIndex === index ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              onClick={(e) => handleSelectPlan(index, e)}
            >
              <span>일정 {index + 1}</span>
              <input
                type="checkbox"
                checked={selectedComparisons.includes(plan.id)}
                onChange={() => toggleSelectComparison(plan.id)}
                className="cursor-pointer"
              />
            </button>
          ))}
        </div>

        {/* 비교, 삭제, 저장 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={openModal}
            disabled={selectedComparisons.length < 2}
            className={`px-4 py-2 text-sm rounded-md ${selectedComparisons.length >= 2 ? "bg-orange-500 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
          >
            비교하기
          </button>
          <button onClick={handleDeletePlan} className="px-4 py-2 text-sm rounded-md bg-red-500 text-white">
            <FaTrashAlt className="mr-1" /> 삭제
          </button>
          <button onClick={() => handleSavePlan(plans[selectedPlanIndex])} className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white">
            <FaSave className="mr-1" /> 저장하기
          </button>
        </div>
      </div>

      {/* 📌 선택된 일정 표시 */}
      {plans.length > 0 && selectedPlanIndex !== null && (
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-lg font-medium mb-2">{plans[selectedPlanIndex].day}</h3>
          <div className="space-y-3">
            {plans[selectedPlanIndex].activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-20 text-sm text-gray-500">{activity.time}</div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📌 비교 모달 */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyles}>
        <h2 className="text-2xl font-bold mb-4">일정 비교</h2>
        <div className="grid grid-cols-3 gap-4">
          {selectedComparisons.map((id) => {
            const plan = plans.find((p) => p.id === id);
            return (
              <div key={id} className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{plan?.days?.[0]?.day}</h3>
                <ul>
                  {plan.activities.map((activity, idx) => (
                    <li key={idx}>{activity.time} - {activity.title}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg">
            확인
          </button>
        </div>
      </Modal>
    </main>
  );
};

export default PlannerPage;
