import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { FaSearch, FaTimes, FaTrashAlt, FaSave, FaBalanceScale } from "react-icons/fa";
import Modal from "react-modal";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import useTravelSearch from "../../components/hooks/useTravelSearch"; // ✅ 커스텀 훅 추가
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "react-router";

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
  const [travelDays, setTravelDays] = useState(0);      // 여행 기간
  const [numberOfPeople, setNumberOfPeople] = useState(1);  // 인원수
  const [selectedThemes, setSelectedThemes] = useState([]); // 선택된 테마
  const [markers, setMarkers] = useState([]);
  const [aiPlan, setAiPlan] = useState([]);

  // ✅ 사용자 정보 상태 (로그인 연동)
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem("user_id"),
  });

  // 상태 추가: AI 일정
  const [aiSchedule, setAiSchedule] = useState(null);


  // 📌 모달 열기 및 닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null); // 📌 Flatpickr 인스턴스 저장

  const {
    isLoggedIn, // 🔹 로그인 여부 추가
    searchTerm, // 🔹 검색어 상태
    showResults, // 🔹 검색 결과 표시 여부
    selectedCity, // 🔹 선택된 도시
    recentSearches, // 🔹 최근 검색어 목록
    suggestedCities, // 🔹 추천 도시 목록
    popularDestinations, // 🔹 인기 여행지 목록
    searchResultsRef, // 🔹 검색 결과 DOM 참조
    handleCountryChange, // 🔹 나라 입력 시 자동완성 처리
    setShowResults, // 🔹 검색 결과 표시 여부 설정
    handleClearSearch, // 🔹 검색어 초기화
    handleCitySelect, // 🔹 도시 선택 처리
    handlePopularDestinationSelect, // 🔹 인기 여행지 선택 처리
    handleRemoveRecentSearch, // 🔹 최근 검색어 삭제
  } = useTravelSearch();

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

  const generateAIPlan = async ({
    city,
    days,
    people,
    style,
    isAddMode = false,  // 일정 추가 모드 (최대 5개 제한)
    saveSearch = false  // 검색어 저장 여부
  }) => {
    if (isAddMode && plans?.length >= 5) {
      alert("최대 5개의 일정만 생성할 수 있습니다.");
      return;
    }

    setIsLoading(true);

    try {
      if (saveSearch) {
        await handleCountryChange(city, "city");
      }

      const response = await axios.post(`${process.env.REACT_APP_FASTAPI_URL}/generate-schedule`, {
        city,
        days,
        people,
        style: style.join(", ")
      });

      const aiData = response.data?.schedule || response.data;

      if (!Array.isArray(aiData)) throw new Error("AI 일정이 유효하지 않음");

      if (isAddMode) {
        const newPlan = {
          id: uuidv4(),
          name: `${city} 여행`,
          days: aiData
        };
        setPlans((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const updated = [...safePrev, newPlan];
          setSelectedPlanIndex(updated.length - 1);
          return updated;
        });
      } else {
        setPlans(aiData); // 전체 덮어쓰기
      }

      const markers = aiData
        .flatMap((day) => day.activities || [])
        .map((a) => ({ lat: a.latitude, lng: a.longitude }))
        .filter((pos) => pos.lat && pos.lng);

      if (markers.length > 0) {
        setMapCenter({ lat: markers[0].lat, lng: markers[0].lng });
      }

      if (!isAddMode) setShowResults(false);

    } catch (error) {
      console.error("❌ AI 일정 처리 실패:", error);
      if (!isAddMode) setPlans([]);
      alert("AI 일정 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selected = plans[selectedPlanIndex];
    if (!selected) return;

    const markerList = selected.days
      .flatMap((day) => day.activities || [])
      .map((activity) => {
        const lat = Number(activity.latitude);
        const lng = Number(activity.longitude);
        return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
      })
      .filter((marker) => marker !== null);

    console.log("📍 변환된 마커 목록:", markerList);

    setMarkers(markerList);

    if (markerList.length > 0) {
      setMapCenter(markerList[0]);
    }

    if (markerList.length === 1) {
      setZoomLevel(15);
    } else if (markerList.length > 1) {
      setZoomLevel(12);
    }

  }, [selectedPlanIndex, plans]);

  const handleGenerateAIPlan = () => {
    generateAIPlan({
      city: country,
      days: parseInt(tripDuration, 10),
      people: adults || 2,
      style: travelStyle,
      isAddMode: true
    });
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.aiPlan) {
      setAiPlan(location.state.aiPlan); // ✅ AI 일정 결과 반영
    }
  }, [location]);

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
            setTravelDays(nights + 1)
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

  // 📌 확인 버튼 클릭 시: 검색어 저장 + AI 일정 요청 + 지도 경로 설정
  const handleConfirmSearch = async () => {
    if (!isLoggedIn || !searchTerm) return;

    try {
      await handleCountryChange(searchTerm, "country");
      setIsLoading(true);

      if (Array.isArray(plans) && plans.length >= 5) {
        alert("일정은 최대 5개까지만 생성할 수 있습니다.");
        return;
      }

      const response = await axios.post("/api/schedule/generate", {
        city: searchTerm,
        days: travelDays,
        people: adults,
        style: travelStyle.join(", ")
      });

      // ✅ 여기에 추가! 응답 구조 확인
      const planData = Array.isArray(response.data) ? response.data : (response.data.schedule || []);
      console.log("📦 백엔드 응답 전체:", planData);

      // ✅ 여기서 상세하게 activity 별 좌표 확인
      planData.forEach((day, i) => {
        console.log(`📅 DAY ${i + 1}`);
        day.activities?.forEach((act, j) => {
          console.log(`  ${j + 1}. ${act.title} → lat: ${act.latitude}, lng: ${act.longitude}`);
        });
      });

      // 🔽 이후 기존 로직은 그대로 둡니다
      const newPlan = {
        id: uuidv4(),
        name: `${searchTerm} 여행`,
        days: planData
      };

      setPlans((prevPlans = []) => {
        const updated = [...prevPlans, newPlan];
        setSelectedPlanIndex(updated.length - 1);
        return updated;
      });

      const extractedMarkers = planData
        .flatMap(day => (day.activities ?? []))
        .map(activity => {
          const lat = Number(activity.latitude);
          const lng = Number(activity.longitude);
          return (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
        })
        .filter(marker => marker !== null);

      console.log("🛰️ 지도 마커 목록:", extractedMarkers); // 👉 여기도 확인

      setMarkers(extractedMarkers);
      if (extractedMarkers.length > 0) {
        setMapCenter(extractedMarkers[0]);
      }

    } catch (e) {
      console.error("❌ AI 일정 생성 실패:", e);
      alert("AI 일정 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 접기/펼치기 토글 함수
  const toggleDay = (dayId) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId], // ✅ 해당 DAY의 상태 반전
    }));
  };

  // 📌 일정 비교 선택 토글
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
  }, [selectedPlanIndex, plans]); // 🔹 selectedPlanIndex 변경될 때 실행


  // 📌 DAY 클릭 시 해당 일정으로 지도 이동
  const handleSelectDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);

    // ✅ 해당 DAY의 첫 번째 위치로 지도 이동 및 줌 조정
    if (plans[selectedPlanIndex]?.days?.length > dayIndex && plans[selectedPlanIndex].days[dayIndex]?.coordinates?.length > 0) {
      setMapCenter(plans[selectedPlanIndex].days[dayIndex].coordinates[0]);
      setZoomLevel(14);
    }
  };

  const toggleTravelStyle = (id) => {
    setTravelStyle((prev) => {
      if (prev.includes(id)) return prev.filter((style) => style !== id);
      if (prev.length < 6) return [...prev, id];
      return prev;
    });
  };

  // 📌 일정 버튼 클릭 시 첫 번째 DAY 선택 및 지도 이동
  const handleSelectPlan = (planIndex, event) => {
    // ✅ 체크박스 클릭 시 일정 변경 방지
    if (event?.target?.type === "checkbox") {
      return;
    }

    // ✅ 선택된 일정 변경
    setSelectedPlanIndex(planIndex);

    // ✅ 선택된 일정의 첫 번째 DAY가 존재하는지 확인
    const firstDay = plans?.[planIndex]?.days?.[0];

    if (firstDay && Array.isArray(firstDay.coordinates) && firstDay.coordinates.length > 0) {
      setMapCenter(firstDay.coordinates[0]); // ✅ 첫 번째 위치로 지도 이동
      setZoomLevel(14); // ✅ 줌 레벨 설정
    }
  };

  // ✅ useEffect를 활용하여 plans 변경 감지 후 최신 인덱스 설정
  useEffect(() => {
    if (Array.isArray(plans) && plans.length > 0) {
      setSelectedPlanIndex(Array.isArray(plans) && plans.length - 1);
    }
  }, [plans]);

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
                value={searchTerm}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                placeholder="여행하고 싶은 나라나 도시를 입력하세요"
                onChange={(e) => handleCountryChange(e.target.value)}
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

            {/* 🔹 자동완성 UI */}
            {showResults && (
              <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
                {/* 📌 최근 검색어 */}
                {Array.isArray(recentSearches) && recentSearches.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500">최근 검색어</h3>
                    <div className="flex flex-wrap gap-2 mt-1 mb-2">
                      {recentSearches.map((search, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white bg-orange-300 cursor-pointer"
                          onClick={() => {
                            console.log("handleCitySelect 호출됨, search 값:", search);
                            handleCitySelect(
                              search && typeof search === "object" && "search_term" in search
                                ? search.search_term
                                : search,
                              ""
                            );
                          }}
                        >
                          {search && typeof search === "object" && "search_term" in search
                            ? search.search_term
                            : search || "알 수 없음"}
                          <FaTimes
                            className="ml-2 text-gray-500 hover:text-white cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRecentSearch(search && typeof search === "object" && "search_term" in search
                                ? search.search_term
                                : search);
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* 🔹 자동완성 추천 도시 */}
                {searchTerm?.length > 0 ? (
                  suggestedCities?.length > 0 ? (
                    suggestedCities.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-orange-300 rounded-lg cursor-pointer group"
                        onClick={() => {
                          handleCitySelect(item.description, "");
                          setShowResults(false); // 🔹 선택 후 목록 닫기
                        }}
                      >
                        <div className="flex flex-col hover:text-white">
                          {item.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">검색 결과 없음</p>
                  )
                ) : (
                  <>
                    {/* 📌 인기 여행지 */}
                    <h3 className="text-sm font-medium text-gray-500">
                      인기 여행지
                    </h3>
                    <div className="grid grid-cols-5 grid-rows-2 gap-2">
                      {Array.isArray(popularDestinations) &&
                        popularDestinations
                          .filter(destination => destination && destination.searchTerm) // ✅ null 또는 이상치 제거
                          .map((destination, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 text-left font-medium text-gray-900 hover:text-white hover:bg-orange-300 rounded-lg cursor-pointer"
                              onClick={() => {
                                handlePopularDestinationSelect(destination.searchTerm);
                                setShowResults(false);
                              }}
                            >
                              {destination.searchTerm}
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
        < div className="bg-white shadow sm:rounded-lg p-6 mb-1" >
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
              onClick={handleConfirmSearch} // ✅ AI 일정 생성 실행
            >
              {/* 여울 로고 이미지 */}
              <img src="images/ui_image/makebutton.png" alt="여울 로고" className="h-12 w-auto m-auto" />
              여울아, 만들어줘
            </button>
          </div>
        </div>
      </div>

      {/* 📌 AI 추천 일정 */}
      {/* 전체 컨테이너 */}
      <div className="bg-white shadow sm:rounded-lg p-6 rounded-lg h-screen flex flex-col">

        {/* 🔹 AI 추천 여행 일정 제목 + 버튼 컨테이너 */}
        <div className=" flex justify-between items-start mb-4">

          {/* 🔸 AI 추천 여행 일정 제목 + 총 일정 목록 */}
          <div className="w-2/3">
            <h2 className="text-2xl font-bold mb-4">AI 추천 여행 일정</h2>
            <div className="flex flex-wrap gap-2 mb-4 max-w-full overflow-x-auto">
              {Array.isArray(plans) && plans.length > 0 ? (
                plans.map((plan, index) => (
                  <button
                    key={plan.id}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md w-32 justify-between ${selectedPlanIndex === index ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    onClick={(e) => handleSelectPlan(index, e)}
                  >
                    <span>일정 {index + 1}</span>
                    <input
                      type="checkbox"
                      className="border-white focus:outline-sky-500 h-5 w-5 text-sky-400 cursor-pointer"
                      checked={selectedComparisons.includes(plan.id)}
                      onChange={() => toggleSelectComparison(plan.id)}
                    />
                  </button>
                ))
              ) : (
                <p className="text-gray-500">일정이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 🔹 버튼 컨테이너 (오른쪽) */}
          <div className="flex gap-2">
            <button
              onClick={openModal}
              className={`flex flex-col items-center justify-center gap-1 w-24 h-15 py-2 text-sm rounded-md ${selectedComparisons.length >= 2 ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              disabled={selectedComparisons.length < 2}
            >
              <FaBalanceScale className="text-lg" />
              비교하기
            </button>

            <button
              onClick={handleDeletePlan}
              className="flex flex-col items-center justify-center gap-1 w-24 h-15 py-2 text-sm rounded-md bg-red-500 text-white"
            >
              <FaTrashAlt className="text-lg" />
              삭제
            </button>

            <button
              onClick={() => handleSave(plans[selectedPlanIndex])}
              className="flex flex-col items-center justify-center gap-1 w-24 h-15 py-2 text-sm rounded-md bg-blue-500 text-white"
            >
              <FaSave className="text-lg" />
              저장하기
            </button>
          </div>
        </div>

        {/* 🔹 본문: 왼쪽 (일정) | 오른쪽 (지도) */}
        <div className="flex flex-grow gap-6">

          {/* 🔹 왼쪽 일정 컨테이너 */}
          <div className="w-1/2 flex flex-col h-full">
            {/* 일정 목록 전체 컨테이너 (스크롤 유지) */}
            <div className="flex-1 overflow-y-auto border-t pt-4 max-h-[600px] pr-2">
              {plans?.length > 0 && selectedPlanIndex !== null && plans[selectedPlanIndex] && (
                <>
                  {/* 일정 제목 */}
                  <h3 className="text-lg font-medium mb-4">{plans[selectedPlanIndex]?.name}</h3>

                  {/* DAY별 일정 출력 */}
                  <div className="space-y-6">
                    {plans[selectedPlanIndex]?.days?.map((day, idx) => (
                      <div
                        key={idx}
                        className="pl-4 border-l-4 border-orange-500 mb-8 pb-6"
                      >
                        {/* DAY 제목 */}
                        <h4 className="font-bold text-lg text-orange-600 mb-3">{day?.day}</h4>

                        {/* 일정 내용 */}
                        {day?.activities?.map((activity, actIdx) => (
                          <div key={actIdx} className="flex items-start gap-4 mb-2">
                            <div className="w-20 text-sm text-gray-500">{activity?.time}</div>
                            <div>
                              <p className="font-medium">{activity?.title}</p>
                              <p className="text-sm text-gray-600">{activity?.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 🔹 오른쪽 지도 (고정) */}
          <div className="w-1/2 sticky top-20 right-0">
            <h2 className="text-2xl font-bold mb-4">지도 보기</h2>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ""}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "600px" }}
                center={mapCenter}
                zoom={zoomLevel}
              >
                {/* 🔸 마커 표시 */}
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker} />
                ))}

                {/* 🔸 이동 경로 선 표시 */}
                {markers.length > 1 && (
                  <Polyline
                    path={markers}
                    options={{
                      strokeColor: "#FF5733",
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                      clickable: false,
                      draggable: false,
                      editable: false
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>

      {/* 비교 모달 */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyles}>
        <h2 className="text-2xl font-bold mb-4">일정 비교</h2>

        {/* 비교할 일정이 있는지 확인 */}
        {selectedComparisons.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {selectedComparisons.map((id) => {
              // ✅ 선택된 일정 ID를 기반으로 `plans`에서 해당 일정 찾기
              const plan = plans.find((p) => p.id === id);

              return plan ? (
                <div key={id} className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{plan.name}</h3> {/* ✅ 일정명이 올바르게 표시되는지 확인 */}
                  <ul>
                    {Array.isArray(plan.days) && plan.days.length > 0 ? (
                      plan.days.map((day, idx) => (
                        <li key={idx} className="mb-2">
                          <h4 className="text-md font-bold text-orange-600">{day.day}</h4>
                          {Array.isArray(day.activities) && day.activities.length > 0 ? (
                            day.activities.map((activity, actIdx) => (
                              <p key={actIdx}>
                                {typeof activity.time === "string" ? activity.time : ""} - {typeof activity.title === "string" ? activity.title : ""}
                              </p>
                            ))
                          ) : (
                            <p className="text-gray-500">활동 정보 없음</p>
                          )}
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">세부 일정이 없습니다.</p>
                    )}
                  </ul>
                </div>
              ) : (
                <p key={id} className="text-gray-500">일정을 찾을 수 없습니다.</p>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">비교할 일정이 없습니다.</p>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg">
            확인
          </button>
        </div>
      </Modal>
    </main >
  );
};

export default PlannerPage;