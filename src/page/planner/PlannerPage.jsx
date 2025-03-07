import React, { useState, useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
  zoom: 12,
};

const PlannerPage = () => {
  const [tripDuration, setTripDuration] = useState("");
  const [travelStyle, setTravelStyle] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [dateRange, setDateRange] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // 📌 달력이 열려 있는지 상태 관리

  const location = useLocation();
  const navigate = useNavigate(); // 📌 페이지 이동을 위한 네비게이션 추가
  const searchParams = new URLSearchParams(location.search);
  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null); // 📌 Flatpickr 인스턴스 저장
  const searchQuery = searchParams.get("search") || "";
  const [country, setCountry] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery) {
      setCountry(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (datePickerRef.current) {
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
          setIsOpen(false); // 📌 날짜 선택이 완료되면 닫힘
        },
        onClose: () => setIsOpen(false), // 📌 Flatpickr가 닫힐 때 상태 변경
      });
    }
  }, []);

  // 여행 스타일 선택 버튼 목록
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

  // 📌 달력 토글 기능
  const toggleDatePicker = () => {
    if (flatpickrInstance.current) {
      if (isOpen) {
        flatpickrInstance.current.close(); // 📌 달력이 열려 있으면 닫기
      } else {
        flatpickrInstance.current.open(); // 📌 달력이 닫혀 있으면 열기
      }
      setIsOpen(!isOpen); // 📌 상태 업데이트
    }
  };

  // 📌 "공유하기" 버튼 클릭 시 글쓰기 페이지로 이동
  const handleShare = () => {
    navigate("/c_write");
  };

  // 📌 "저장하기" 버튼 클릭 시 mypage에 일정 저장
  const handleSave = () => {
    const savedCourses = JSON.parse(localStorage.getItem("savedCourses")) || [];
    const newCourse = {
      country,
      dateRange,
      tripDuration,
      travelStyle,
      itinerary,
    };
    localStorage.setItem("savedCourses", JSON.stringify([...savedCourses, newCourse]));

    alert("여행 일정이 마이페이지에 저장되었습니다!");
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 py-8 mt-16">
      {/* 타이틀 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          나만의 완벽한 여행 일정을 만들어보세요
        </h1>
        <small className="text-lg text-gray-600">
          AI가 당신의 선호도에 맞는 최적의 여행 일정을 제안해드립니다
        </small>
      </div>

      {/* 여행 정보 입력 */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold mb-6">여행 정보 입력</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 국가</label>
            <input
              type="text"
              placeholder="여행하고 싶은 나라를 입력하세요"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
            />
          </div>

          {/* 여행 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 기간</label>
            <div className="relative">
              <i className="far fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={toggleDatePicker}></i>
              <input
                ref={datePickerRef}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer"
                placeholder="여행 날짜를 선택하세요"
                onClick={toggleDatePicker} // 📌 클릭 시 달력 토글
                readOnly // 📌 키보드 입력 방지 (달력으로만 선택)
              />
            </div>
            {tripDuration &&
              <div className="mt-2 text-xl text-gray-600 mb-6">
                <span>{tripDuration}</span>
              </div>
            }
          </div>
        </div>

        {/* 여행 스타일 */}
        <div className="bg-white shadow sm:rounded-lg p-6 mb-1">
          <h2 className="text-xl font-semibold mb-6">여행 스타일 선택 (최대 6개)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {travelStyles.map((style) => (
              <button
                key={style.id}
                className={`flex flex-col items-center p-4 border-2 rounded-lg shadow-md w-full transition-colors duration-200 ${travelStyle.includes(style.id) ? 'border-orange-500 bg-white-200' : 'border-gray-200'}`}
                onClick={() => toggleTravelStyle(style.id)}
              >
                <i className={`${style.icon} text-2xl mb-2 ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}></i>
                <span className={`text-sm font-medium ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}>{style.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center flex justify-end">
          <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-lg font-bo ld shadow-md items-center justify-center gap-2">
            <img src="/images/yeoul_logo.png" alt="여울 로고" className="h-12 w-auto" />
            여울아, 만들어줘
          </button>
        </div>
      </div>

      {/* AI 추천 일정 */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">AI 추천 여행 일정</h2>
        <div className="flex gap-4 overflow-x-auto">
          <div className="w-1/2 p-4 bg-gray-50 rounded-lg shadow">
            {itinerary.map((dayPlan, index) => (
              <div key={index} className={`border-t-4 pt-4 px-6 min-w-[300px] ${index === 0 ? "border-custom" : "border-indigo-300"}`}>
                <h3 className="text-lg font-medium mb-2">{dayPlan.day}</h3>
                <div className="space-y-3">
                  {dayPlan.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-32 text-sm text-gray-500 font-medium bg-blue-100 text-blue-700 rounded px-2 py-1">
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

          {/* 지도 */}
          <div className="bg-white shadow sm:rounded-lg p-3 w-1/2">
            <h2 className="text-2xl font-bold mb-4">지도 보기</h2>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
              <GoogleMap mapContainerStyle={containerStyle} center={{ lat: mapCenter.lat, lng: mapCenter.lng }} zoom={mapCenter.zoom} />
            </LoadScript>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlannerPage;
