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
  const [expandedDays, setExpandedDays] = useState({}); // ✅ 하루 일정 펼침 상태
  const [zoomLevel, setZoomLevel] = useState(12); // 🔹 기본 줌 레벨 설정
  const [selectedDayIndex, setSelectedDayIndex] = useState(null); // ✅ 선택된 DAY

  // 📌 모달 열기 및 닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  // 📌 접기/펼치기 토글 함수
  const toggleDay = (dayId) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId], // ✅ 해당 DAY의 상태 반전
    }));
  };

  const toggleSelectComparison = (id) => {
    setSelectedComparisons((prev = []) => {
      if (prev.includes(id)) {
        return prev.filter((planId) => planId !== id);
      }
      return prev.length < 3 ? [...prev, id] : prev;
    });
  };

  // ✅ selectedPlanIndex가 변경될 때 selectedDayIndex 자동 변경
  useEffect(() => {
    if (selectedPlanIndex !== null && plans[selectedPlanIndex]?.days?.length > 0) {
      setSelectedDayIndex(0); // 첫 번째 DAY 자동 선택
    }
  }, [selectedPlanIndex]); // 🔹 selectedPlanIndex 변경될 때 실행

  // 📌 DAY 클릭 시 해당 일정으로 지도 이동
  const handleSelectDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);

    // ✅ 해당 DAY의 첫 번째 위치로 지도 이동 및 줌 조정
    if (plans[selectedPlanIndex]?.days?.length > dayIndex && plans[selectedPlanIndex].days[dayIndex]?.coordinates?.length > 0) {
      setMapCenter(plans[selectedPlanIndex].days[dayIndex].coordinates[0]);
      setZoomLevel(14);
    }
  };

  // 📌 여행 스타일 선택 및 해제 기능 (최대 6개 선택 가능)
  const travelStyles = [
    { id: "도시 관광", icon: "fas fa-city" },
    { id: "문화지 관광", icon: "fas fa-landmark" },
    { id: "랜드마크 투어", icon: "fas fa-map-marked-alt" },
    { id: "체험 중심 투어", icon: "fas fa-hands-helping" },
    { id: "맛집 투어", icon: "fas fa-utensils" },
    { id: "쇼핑 투어", icon: "fas fa-shopping-bag" },
    { id: "액티비티", icon: "fas fa-running" },
    { id: "효도 관광", icon: "fas fa-user-friends" },
    { id: "힐링", icon: "fas fa-spa" },
    { id: "호캉스", icon: "fas fa-hotel" },
    { id: "휴양", icon: "fas fa-umbrella-beach" },
    { id: "반려동물과 함께", icon: "fas fa-paw" },
    { id: "명소 투어", icon: "fas fa-binoculars" },
    { id: "축제 문화 투어", icon: "fas fa-music" },
  ];

  const toggleTravelStyle = (id) => {
    setTravelStyle((prev) => {
      if (prev.includes(id)) return prev.filter((style) => style !== id);
      if (prev.length < 6) return [...prev, id];
      return prev;
    });
  };

  // 📌 일정 버튼 클릭 시 첫 번째 DAY 선택 및 지도 이동
  const handleSelectPlan = (planIndex) => {
    setSelectedPlanIndex(planIndex);

    // ✅ 첫 번째 DAY의 첫 번째 위치로 지도 이동
    if (plans[planIndex]?.days?.length > 0 && plans[planIndex].days[0].coordinates.length > 0) {
      setMapCenter(plans[planIndex].days[0].coordinates[0]);
      setZoomLevel(14);
    }
  };

  // ✅ useEffect를 활용하여 plans 변경 감지 후 최신 인덱스 설정
  useEffect(() => {
    if (Array.isArray(plans) && plans.length > 0) {
      setSelectedPlanIndex(Array.isArray(plans) && plans.length - 1);
    }
  }, [plans]);

  // ✅ AI 일정 생성 + 더미 데이터 방식 통합
  const handleGenerateAIPlan = async () => {
    try {
      if (Array.isArray(plans) && plans.length >= 5) {
        alert("최대 5개의 일정만 생성할 수 있습니다.");
        return;
      }

      setIsLoading(true); // 📌 로딩 상태 활성화
      console.log("🚀 AI 요청 시작...");

      // 🔹 AI 요청 데이터 준비
      const requestData = {
        country,
        dateRange,
        tripDuration,
        travelStyle,
      };

      console.log("📡 AI 요청 데이터:", requestData);

      let aiPlans = null; // 🛑 AI 응답 데이터를 저장할 변수

      // 🚀 [AI 연동 시 활성화]
      /*
      try {
        const response = await axios.post("/api/ai/generate-plan", requestData);
        aiPlans = response.data.map((plan) => ({
          ...plan,
          id: plan.id || uuidv4(), // ✅ AI 응답 데이터에도 ID 추가
        }));
  
        if (!aiPlans || aiPlans?.length === 0) {
          throw new Error("AI 일정 응답이 없습니다."); 
        }
  
        console.log("✅ AI 응답 데이터:", aiPlans);
      } catch (error) {
        console.error("❌ AI 일정 추천 실패:", error);
        alert("AI 일정 추천 중 오류가 발생했습니다. 더미 데이터를 사용합니다.");
      }
      */

      // 🛑 [AI 활성화 후 삭제]
      const dummyPlans = [
        {
          id: uuidv4(),
          day: `DAY 1`,
          coordinates: [
            { lat: 37.5651, lng: 126.9783 }, // 명동
            { lat: 37.5796, lng: 126.9770 }, // 경복궁
            { lat: 37.5724, lng: 126.9768 }, // 광화문
          ],
          activities: [
            { time: "09:00", title: "🏰 명동 관광", desc: "쇼핑과 현지 음식 체험" },
            { time: "14:00", title: "🏛️ 경복궁", desc: "한국의 대표적인 고궁 관람" },
            { time: "18:00", title: "🌆 광화문 광장", desc: "야경 감상 및 저녁 식사" },
          ],
        },
        {
          id: uuidv4(),
          day: `DAY 2`,
          coordinates: [
            { lat: 37.5512, lng: 126.9882 }, // 남산서울타워
            { lat: 37.5348, lng: 126.9948 }, // 이태원
          ],
          activities: [
            { time: "10:00", title: "🗼 남산서울타워", desc: "서울 전경 감상" },
            { time: "15:00", title: "🌎 이태원", desc: "다문화 거리 탐방" },
          ],
        },
      ];
      // 🛑 [AI 활성화 후 삭제]

      // 🚀 AI 일정이 있으면 AI 데이터 사용, 없으면 더미 데이터 사용
      const finalPlans = aiPlans && aiPlans?.length > 0 ? aiPlans : dummyPlans;

      // ✅ 일정 중복 방지 (ID 기반) + 기본값 설정
      const uniquePlans = finalPlans.filter(
        (newPlan) => !(plans || []).some((existingPlan) => existingPlan.id === newPlan.id)
      );

      // ✅ 여기서 setPlans()를 수정합니다.
      setPlans((prevPlans = []) => {
        const updatedPlans = [...(prevPlans || []), ...uniquePlans];

        // 🔹 추가된 일정 콘솔 로그 확인
        console.log("📌 업데이트된 일정 목록:", updatedPlans);

        return updatedPlans; // 🔹 여기서 `setSelectedPlanIndex()`를 실행하지 않음
      });

    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 일정 저장 함수 (로컬스토리지 + API 연동)
  const handleSave = async () => {
    try {
      setIsSaving(true); // 📌 저장 로딩 상태 활성화

      // ✅ 로그인 여부 확인
      if (!isLoggedIn || !currentUser?.id) {
        alert("로그인 후 여행 일정을 저장할 수 있습니다.");
        setIsSaving(false);
        return;
      }

      // ✅ DB에 저장할 데이터 준비
      const newSchedule = {
        userId: currentUser.id, // ✅ 로그인한 사용자의 ID 추가
        country,
        dateRange,
        tripDuration,
        travelStyle,
        plans, // ✅ 기존 코드에는 없던 일정 목록도 추가 저장
      };

      // 🚀 [API 요청] - DB 연동 시 이 부분 활성화
      await axios.post("/api/schedule/save", newSchedule); // 🛑 [DB 연동 후 유지]

      // 🛑 [로컬스토리지 저장] - DB 연동 후 삭제해야 함
      const savedSchedules = JSON.parse(localStorage.getItem(`savedSchedules_${currentUser.id}`)) || [];
      localStorage.setItem(`savedSchedules_${currentUser.id}`, JSON.stringify([...savedSchedules, newSchedule]));
      // ❌ [DB 연동 후 삭제] ↑ 이 부분 제거 가능

      alert("여행 일정이 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("일정 저장 실패", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false); // 📌 저장 로딩 상태 해제
    }
  };

  // ✅ 일정 불러오기 함수 (페이지 로드 시 실행)
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      const savedSchedules = JSON.parse(localStorage.getItem(`savedSchedules_${currentUser.id}`)) || [];
      if (savedSchedules?.length > 0) {
        setPlans(savedSchedules[savedSchedules?.length - 1].plans); // 🔹 마지막 저장된 일정 불러오기
      }
    }
  }, [isLoggedIn, currentUser]);

  // ✅ 일정 삭제 함수
  const handleDeletePlan = (id) => {
    if (Array.isArray(plans) && plans.length === 0) {
      alert("삭제할 일정이 없습니다.");
      return;
    }

    setPlans((prevPlans) => {
      const updatedPlans = prevPlans.filter((plan) => plan.id !== id);
      setSelectedComparisons((prev) => prev.filter((planId) => planId !== id));

      // ✅ 남은 일정이 있으면 첫 번째 일정으로 이동, 없으면 초기화
      setSelectedPlanIndex(updatedPlans.length > 0 ? 0 : null);

      // ✅ [로컬스토리지 반영] - DB 연동 후 삭제 가능
      if (isLoggedIn && currentUser?.id) {
        localStorage.setItem(`savedSchedules_${currentUser.id}`, JSON.stringify(updatedPlans));
      }

      return updatedPlans;
    });

    alert("일정이 삭제되었습니다.");
  };

  // 📌 달력 토글 기능
  const toggleDatePicker = () => {
    if (flatpickrInstance.current) {
      if (isDatePickerOpen) {
        flatpickrInstance.current.close(); // 📌 달력이 열려 있으면 닫기
      } else {
        flatpickrInstance.current.open(); // 📌 달력이 닫혀 있으면 열기
      }
      setIsDatePickerOpen(!isDatePickerOpen); // 📌 상태 업데이트
    }

    // ✅ 인원수 드롭다운 닫기 (달력과 인원수가 동시에 열리지 않도록)
    setIsPeopleOpen(false);
  };

  /** ✅ 메인 배너 검색 (여행 코스 검색) */
  const handleSearch = () => {

    /* try {
      // 🔹 AI API 요청 (axios 사용)
      const response = await axios.post("https://your-ai-api.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });

      const result = await response.json();

      // 🔹 검색 결과가 존재하는 경우, MainContent로 이동
      window.location.href = `/ course ? search = ${ encodeURIComponent(searchTerm) }`;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 문제가 발생했습니다.");
    } */
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 py-8 mt-16">
      {/* 📌 타이틀 */}
      <div className="mb-12 bg-sky-200 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          여울이와 함께 여행일정을 만들어 보세요.
        </h1>
        <small className="text-lg text-gray-900">
          AI 여울이가 당신의 선호도에 맞는 최적의 여행 일정을 제안해드립니다.
        </small>
      </div>

      {/* 여행 정보 입력 */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6">여행 정보 입력</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-3">

          {/* 여행 국가 입력 */}
          <div className="relative max-w-lg w-full" ref={searchResultsRef}>
            <label className="block text-sm font-medium text-gray-700">여행 국가</label>

            <div className="relative">
              {/* 🔍 검색 아이콘 */}
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-lg" />
              </div>

              {/* 🔹 여행 국가 검색 입력창 */}
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                placeholder="여행하고 싶은 나라나 도시를 입력하세요"
                value={searchTerm}
                onChange={(e) => handleCountryChange(e.target.value || "")} // ✅ 값이 없으면 빈 문자열("")로 설정
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => setShowResults(true)} // 🔹 포커스 시 자동완성 UI 열림
              />

              {/* ❌ X 버튼 (검색어 초기화) */}
              {searchTerm?.length > 0 || selectedCity ? (
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={handleClearSearch}
                >
                  <FaTimes className="text-gray-400 text-lg" />
                </div>
              ) : null}
            </div>

            {/* 🔹 자동완성 UI (최근 검색어 + 추천 도시 + 인기 여행지 포함) */}
            {showResults && suggestedCities && (
              <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
                {/* <div className="absolute top-full left-0 mt-1 border border-white rounded-lg shadow-lg p-3 z-50 w-[700px] max-h-[220px] overflow-y-auto scrollbar-hide"> */}

                {/* 📌 최근 검색어 */}
                {recentSearches.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500">최근 검색어</h3>
                    <div className="flex flex-wrap gap-2 mt-1 mb-2">
                      {recentSearches.map((search, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white bg-orange-300 cursor-pointer"
                          onClick={() => handleCitySelect(search, "")}
                        >
                          {search}
                          <FaTimes
                            className="ml-2 text-gray-500 hover:text-white cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // 🔹 이벤트 버블링 방지
                              handleRemoveRecentSearch(search);
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* 📌 자동완성 추천 도시 */}
                {searchTerm?.length > 0 ? (
                  suggestedCities?.length > 0 ? (
                    suggestedCities.map(({ city, country }, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-orange-300 rounded-lg cursor-pointer group"
                        onClick={() => {
                          handleCitySelect(city, country);
                          setShowResults(false); // 🔹 선택 후 목록 닫기
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="font-medium group-hover:text-white">{city}</div>
                          <div className="text-sm text-gray-500 group-hover:text-white">{country}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">검색 결과 없음</p>
                  )
                ) : (
                  <>
                    {/* 📌 인기 여행지 */}
                    <h3 className="text-sm font-medium text-gray-500 mt-4 mb-3">인기 여행지</h3>
                    <div className="flex flex-wrap gap-4">
                      {popularDestinations.map((destination, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 text-center font-medium text-gray-900 hover:text-white hover:bg-orange-300 rounded-lg cursor-pointer"
                          onClick={() => {
                            handlePopularDestinationSelect(destination);
                            setShowResults(false); // 🔹 선택 후 목록 닫기
                          }}
                        >
                          {destination}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 여행 기간 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 기간</label>
            <div className="relative">
              <i
                className="far fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              ></i>
              <input
                ref={datePickerRef}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer"
                placeholder="여행 날짜를 선택하세요"
                onClick={toggleDatePicker} // 📌 클릭 시 달력 토글
                readOnly // 📌 키보드 입력 방지 (달력으로만 선택)
              />
            </div>
            {tripDuration &&
              <div className="mt-2 text-xl text-white">
                <span>{tripDuration}</span>
              </div>
            }
          </div>

          {/* 📌 인원 선택 기능 추가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">인원수</label>
            <div
              className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer flex justify-between items-center"
              onClick={() => setIsPeopleOpen(!isPeopleOpen)}
            >
              <span className="text-gray-700">
                인원 {adults}명
              </span>
              <i className={`fas fa-chevron-${isPeopleOpen ? "up" : "down"} text-gray-500`}></i>
            </div>

            {/* 📌 인원 선택 드롭다운 */}
            {isPeopleOpen && (
              <div className="border border-gray-300 mt-2 rounded-lg p-4 shadow-lg bg-white">
                {/* 성인 선택 */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700">인원 수</span>
                  <div className="flex items-center">
                    <button
                      className="px-3 py-1 border rounded-full text-blue-500 hover:text-white hover:bg-orange-500"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                    >
                      −
                    </button>
                    <span className="mx-3">{adults}</span>
                    <button
                      className="px-3 py-1 border rounded-full text-blue-500 hover:text-white hover:bg-orange-500"
                      onClick={() => setAdults(adults + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 확인 버튼 */}
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg" onClick={() => setIsPeopleOpen(false)}>
                  확인
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 여행 테마 */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-1">
          <h2 className="text-xl font-semibold mb-6">여행 테마 선택 (최대 6개)</h2>

          {/* 초기화 버튼을 오른쪽 끝으로 배치 및 기능 구현 */}
          <div className="flex justify-end mb-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-4 rounded-lg text-xl font-bold shadow-md"
              onClick={() => setTravelStyle([])} // 🔹 선택된 스타일 초기화
            >
              초기화
            </button>
          </div>

          {/* 여행 테마 선택 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {travelStyles.map((style) => (
              <button
                key={style.id}
                className={`flex flex-col items-center p-4 border-2 rounded-lg shadow-md w-full transition-colors duration-200 ${travelStyle.includes(style.id) ? 'border-orange-500' : 'border-gray-200'}`}
                onClick={() => toggleTravelStyle(style.id)}
              >
                <i className={`${style.icon} text-2xl mb-2 ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}></i>
                <span className={`text-sm font-medium ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}>{style.id}</span>
              </button>
            ))}
          </div>

          {/* 📌 AI 요청 버튼 */}
          <div className="mt-6 text-center flex justify-end">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-lg font-bold shadow-md items-center justify-center gap-2"
              onClick={handleGenerateAIPlan} // ✅ AI 일정 생성 실행
            >
              {/* 여울 로고 이미지 */}
              <img src="images/ui_image/makebutton.png" alt="여울 로고" className="h-12 w-auto m-auto" />
              여울아, 만들어줘
            </button>
          </div>
        </div>
      </div>

      {/* 📌 AI 추천 일정 */}
      <div className="bg-white shadow sm:rounded-lg p-6 rounded-lg shadow">
        <div className="flex gap-6 justify-between overflow-x-auto md-3">

          {/* AI 추천 일정 */}
          <div className="w-1/2 p-4 bg-white">
            <h2 className="text-2xl font-bold mb-4">AI 추천 여행 일정</h2>
            {/* 📌 일정 목록 */}
            {plans.map((dayPlan, index) => (
              <div key={index} className={`border-t-4 pt-4 px-6 min-w-[300px] ${index === 0 ? "border-custom" : "border-indigo-300"}`}>
                <h3 className="text-lg font-medium mb-2">{dayPlan.day}</h3>
                <div className="space-y-3">
                  {dayPlan.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-32 text-sm text-white font-medium bg-orange-300 rounded px-2 py-1">
                        {activity.time}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 지도 및 저장 버튼을 포함한 컨테이너 */}
          <div className="w-1/2 p-4 bg-white">
            <h2 className="text-2xl font-bold mb-4">지도 보기</h2>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ""}>
              <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={defaultCenter.zoom} />
            </LoadScript>
          </div>
        </div>
        {/* 📌 일정 저장 버튼 */}
        <div className="flex justify-end mt-auto">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-md"
            onClick={handleSave}
          >
            일정 저장하기
          </button>
        </div>
      </div>
    </main>
  );
};

export default PlannerPage;