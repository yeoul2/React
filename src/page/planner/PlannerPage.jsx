import React, { useState, useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import TravelSearch from "./TravelSearch"; // TravelSearch 컴포넌트 import

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
  // const [itinerary, setItinerary] = useState([]); // 📌 AI 추천 일정 (기본은 빈 값)
  const [country, setCountry] = useState(""); // 여행 국가
  const [isLoading, setIsLoading] = useState(false); // AI 응답 로딩 상태
  const [isSaving, setIsSaving] = useState(false); // DB 저장 로딩 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 📌 달력 토글 상태
  const [isPeopleOpen, setIsPeopleOpen] = useState(false); // 📌 인원 선택 드롭다운 상태
  const [adults, setAdults] = useState(2); // 📌 성인 인원 수
  const [children, setChildren] = useState(0); // 📌 어린이 인원 수

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || ""; // 검색한 국가 가져오기
  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null); // 📌 Flatpickr 인스턴스 저장

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
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy(); // 언마운트 시 인스턴스 제거
      }
    };
  }, []);

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
      if (prev.includes(id)) {
        return prev.filter((style) => style !== id);
      } else if (prev.length < 6) {
        return [...prev, id];
      }
      return prev;
    });
  };

  // AI 추천 일정 데이터
  const itinerary = [
    {
      day: "Day 1",
      activities: [
        { time: "09:00", title: "🏰 명동 관광", description: "쇼핑과 현지 음식 체험" },
        { time: "14:00", title: "🏛️ 경복궁", description: "한국의 대표적인 고궁 관람" },
        { time: "18:00", title: "🌆 광화문 광장", description: "야경 감상 및 저녁 식사" },
      ],
    },
    {
      day: "Day 2",
      activities: [
        { time: "10:00", title: "🗼 남산서울타워", description: "서울 전경 감상" },
        { time: "15:00", title: "🌎 이태원", description: "다문화 거리 탐방" },
      ],
    },
  ];

  /* 
  // 📌 AI 연동 함수 (AI가 추천 일정 생성)
  const handleAIRecommendation = async () => {
    try {
      setIsLoading(true); // 📌 로딩 상태 활성화

      // ✅ AI에 전달할 데이터 준비
      const requestData = {
        country,
        dateRange,
        tripDuration,
        travelStyle,
      };

      // ✅ AI API 요청 (실제 AI 연동 시 API URL 수정 필요)
      const response = await axios.post("/api/ai-recommendation", requestData);

      // ✅ AI 응답 처리
      if (response.data) {
        setItinerary(response.data.itinerary); // AI가 생성한 일정 반영

        // ✅ AI 추천 일정의 첫 번째 장소로 지도 이동
        if (response.data.itinerary.length > 0 && response.data.itinerary[0].activities.length > 0) {
          const firstLocation = response.data.itinerary[0].activities[0];
          setMapCenter({ lat: firstLocation.lat, lng: firstLocation.lng, zoom: 12 });
        }
      }
    } catch (error) {
      console.error("AI 일정 추천 실패", error);
      alert("AI 일정 추천 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 📌 로딩 상태 해제
    }
  };
 */

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

  // 📌 인원 선택 토글 기능
  const togglePeopleDropdown = () => {
    setIsPeopleOpen(!isPeopleOpen); // ✅ 인원수 상태만 변경

    // ✅ 달력 닫기 (달력과 인원수가 동시에 열리지 않도록)
    setIsDatePickerOpen(false);
  };

  // 📌 DB에 일정 저장
  const handleSave = async () => {
    try {
      setIsSaving(true); // 📌 저장 로딩 상태 활성화

      // ✅ DB에 저장할 데이터 준비
      const newCourse = {
        country,
        dateRange,
        tripDuration,
        travelStyle,
        itinerary,
      };

      // 📌 DB 저장 요청
      await axios.post("/api/schedule/save", newCourse);

      // 📌 마이페이지에 저장 (로컬스토리지 활용)
      const savedCourses = JSON.parse(localStorage.getItem("savedCourses")) || [];
      localStorage.setItem("savedCourses", JSON.stringify([...savedCourses, newCourse]));

      alert("여행 일정이 저장되었습니다!");
    } catch (error) {
      console.error("일정 저장 실패", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false); // 📌 저장 로딩 상태 해제
    }
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
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 국가</label>
            <TravelSearch setCountry={setCountry} /> {/* TravelSearch 컴포넌트 추가 */}
          </div>

          {/* 여행 기간 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 기간</label>
            <div className="relative">
              <i className="far fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer mb-3" onClick={toggleDatePicker}></i>
              <input
                ref={datePickerRef}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer"
                placeholder="여행 날짜를 선택하세요"
                onClick={toggleDatePicker} // 📌 클릭 시 달력 토글
                readOnly // 📌 키보드 입력 방지 (달력으로만 선택)
              />
            </div>
            {tripDuration &&
              <div className="mt-2 text-xl text-gray-600">
                <span>{tripDuration}</span>
              </div>
            }
          </div>

          {/* 📌 인원 선택 기능 추가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">인원수</label>
            <div
              className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer flex justify-between items-center"
              onClick={togglePeopleDropdown}
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

        {/* 여행 스타일 */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-1">
          <h2 className="text-xl font-semibold mb-6">여행 스타일 선택 (최대 6개)</h2>

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
            // onClick={handleAIRecommendation}
            // disabled={isLoading}
            >
              {/* 여울 로고 이미지 */}
              <img src="/images/yeoul_logo.png" alt="여울 로고" className="h-12 w-auto" />
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
            {itinerary.map((dayPlan, index) => (
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
              <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={mapCenter.zoom} />
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