import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import useTravelSearch from "../../components/hooks/useTravelSearch"; // ✅ 커스텀 훅 적용
import mainImg from "../../assets/여행지 이미지/한국/한국여행지.jpg";
import korea from "../../assets/여행지 이미지/한국/불꽃놀이.jpg";
import japan from "../../assets/여행지 이미지/일본/훗카이도 시코쓰 호수 얼음 축제.jpg";
import italian from "../../assets/여행지 이미지/이탈리아/베로나 오페라 페스티벌.JPG";
import thailand from "../../assets/여행지 이미지/태국/코팡안 풀문 파티.JPG";
import maldives from "../../assets/여행지 이미지/몰디브/몰디브 전통 보트.JPG";
import usa from "../../assets/여행지 이미지/미국/뉴욕 타임스퀘어 새해맞이.JPG";
import { saveSearch } from "../../services/travelSearchLogic";

// 나라 리스트 데이터
const continents = [
  { name: "대한민국", image: korea, description: "한국의 멋진 여행지를 만나보세요." },
  { name: "일본", image: japan, description: "일본의 전통과 현대가 공존하는 여행지." },
  { name: "이탈리아", image: italian, description: "이탈리아의 아름다운 건축과 문화를 경험하세요." },
  { name: "태국", image: thailand, description: "태국의 이국적인 휴양지를 즐겨보세요." },
  { name: "몰디브", image: maldives, description: "몰디브의 환상적인 해변을 만나보세요." },
  { name: "미국", image: usa, description: "미국의 다양한 여행 명소를 탐방하세요." },
];

const HomePage = () => {
  const navigate = useNavigate(); // ✅ useNavigate 사용
  const [tripDuration, setTripDuration] = useState(""); // 여행 기간
  const [dateRange, setDateRange] = useState([]); // 날짜 선택
  const [adults, setAdults] = useState(2); // 📌 성인 인원 수
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 📌 달력 토글 상태
  const [isPeopleOpen, setIsPeopleOpen] = useState(false); // 인원 수 토글 상태
  const [continentSearchText, setContinentSearchText] = useState(""); // ✅ 나라 검색 상태
  const [filteredContinents, setFilteredContinents] = useState(continents);
  const [selectedCountry, setSelectedCountry] = useState(null); // 🔹 모달 상태 관리
  const [countryInfo, setCountryInfo] = useState(null); // ✅ 나라 정보 상태 추가

  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null);

  // ✅ 커스텀 훅 적용
  const {
    isLoggedIn, // 🔹 로그인 여부 추가
    currentUser, // 🔹 현재 로그인한 사용자 정보 추가
    searchTerm, // 🔹 검색어 상태
    showResults, // 🔹 검색 결과 표시 여부
    selectedCity, // 🔹 선택된 도시
    setSelectedCity, // ✅ 이 줄 추가!!
    recentSearches, // 🔹 최근 검색어 목록
    suggestedCities, // 🔹 추천 도시 목록
    popularDestinations, // 🔹 인기 여행지 목록
    searchResultsRef, // 🔹 검색 결과 DOM 참조
    handleCountryChange, // 🔹 나라 입력 시 자동완성 처리
    saveSearch, // 🔹 검색어 저장 함수 (백엔드 API 호출)
    setSearchTerm, // 🔹 검색어 변경 함수
    setShowResults, // 🔹 검색 결과 표시 여부 설정
    handleCountrySelect, // 🔹 나라 선택 처리
    handlePopularDestinationSelect, // 🔹 인기 여행지 선택 처리
    handleClickOutside, // 🔹 검색창 외부 클릭 시 닫기
    getSuggestedCities, // 🔹 도시 추천 기능 (더미 데이터 + API 사용)
    handleRemoveRecentSearch, // 🔹 최근 검색어 삭제
    updateRecentSearches, // 🔹 최근 검색어 업데이트
  } = useTravelSearch();

  // 📌 Flatpickr 초기화 및 관리
  useEffect(() => {
    if (datePickerRef.current) {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 기존 인스턴스 제거

      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        locale: "ko", // 📌 한국어 설정
        mode: "range", // 📌 시작일 - 종료일 선택
        dateFormat: "Y.m.d", // 📌 날짜 포맷 (예: 03.14)
        minDate: "today", // 📌 오늘 이전 날짜 선택 불가
        disableMobile: true, // 📌 모바일 기본 datepicker 비활성화
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            setDateRange(selectedDates); // 선택된 날짜 저장

            // ✅ 날짜 포맷 변환 함수 (MM월 DD일 (요일))
            const formatDate = (date) => {
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const weekday = date
                .toLocaleDateString("ko-KR", { weekday: "short" })
                .replace("요일", ""); // 🔹 요일을 한 글자로 변환
              return `${month}월 ${day}일 (${weekday})`;
            };

            // ✅ 출발 날짜 & 종료 날짜 설정
            const startDate = selectedDates[0];
            const endDate = selectedDates[1];

            // ✅ 숙박 일수 계산
            const nights = Math.round(
              (endDate - startDate) / (1000 * 60 * 60 * 24)
            );

            // ✅ "MM월 DD일 (요일) ~ MM월 DD일 (요일) (X박)" 형식으로 변환
            setTripDuration(
              `${formatDate(startDate)} ~ ${formatDate(endDate)} (${nights}박)`
            ); // 📌 여행 기간 표시
          }
          setIsDatePickerOpen(false); // 📌 날짜 선택 시 달력 닫기
        },
        onClose: () => setIsDatePickerOpen(false), // 📌 빈 곳 클릭 시 달력 닫기
      });
    }
    return () => {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 언마운트 시 인스턴스 제거
    };
  }, []);

  // ✅ 여행 계획하기 버튼 클릭 시 PlannerPage로 이동
  const handlePlanTrip = async () => {
    if (!selectedCity || dateRange.length < 2) {
      alert("도시와 여행 기간을 입력하세요.");
      return;
    }

    try {
      const requestData = {
        country: selectedCity,  // 검색한 나라 또는 도시
        city: selectedCity,
        days: Math.round((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24)),
        people: adults
      };

      const response = await axios.post(`${process.env.REACT_APP_FASTAPI_URL}generate-schedule`, requestData);
      const aiPlan = response.data;

      navigate('/planner', { state: { aiPlan } }); // 📌 PlannerPage로 이동하며 결과 전달
    } catch (error) {
      console.error("❌ AI 일정 생성 실패:", error);
      alert("AI 일정을 생성하는 데 실패했습니다.");
    }

    if (!selectedCity || dateRange.length < 2) {
      alert("도시와 여행 기간을 입력하세요.");
      return;
    }
    navigate(
      `/course?city=${selectedCity}&start=${dateRange[0]}&end=${dateRange[1]}&adults=${adults}`
    );
  };

  const handleCitySelect = async (city, country) => {
    setSelectedCity(city);
    setSearchTerm(city);
    setShowResults(false);

    // ✅ 선택한 도시를 최근 검색어로 저장
    const accessToken = localStorage.getItem("accessToken");
    try {
      await saveSearch(city, "city", accessToken);
    } catch (error) {
      console.error("❌ 자동완성 선택 후 검색어 저장 실패:", error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCity("");
    setShowResults(false);
  };

  /** ✅ 메인 배너 검색 (여행 코스 검색) */
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const accessToken = localStorage.getItem("accessToken");

      try {
        await saveSearch(searchTerm, "city", accessToken);
      } catch (error) {
        console.error("❌ 검색어 저장 실패:", error);
      }
      navigate(`/course?search=${encodeURIComponent(searchTerm)}`);
    }

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

  // ✅ 나라 검색 자동완성 기능 개선
  const handleContinentSearch = (e) => {
    const searchText = e.target.value.toLowerCase();
    setContinentSearchText(searchText);

    if (searchText.trim() === "" && filteredContinents !== continents) {
      setFilteredContinents(continents);
      return;
    }

    // 🔍 입력값이 포함된 나라만 필터링
    const filtered = continents.filter((continent) =>
      continent.name.toLowerCase().includes(searchText)
    );

    setFilteredContinents(filtered);
  };

  //** ✅ 나라 클릭 시 모달 표시
  const handleClick = async (continent) => {
    setSelectedCountry(continent); // 카드의 기본 정보 (이름, 이미지 등)
    try {
      const response = await axios.get(
        `https://restcountries.com/v3.1/name/${continent.name}`
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCountryInfo(response.data[0]); // API 정보 저장
      } else {
        setCountryInfo(null); // 정보가 없을 경우
      }
    } catch (error) {
      console.error("나라 정보 불러오기 실패:", error);
      setCountryInfo(null); // 예외 발생 시도 null
    }
  };

  const handleCloseModal = () => {
    setSelectedCountry(null);
    setContinentSearchText(""); // 🔹 검색어 초기화
    setFilteredContinents(continents); // 🔹 나라 목록 초기화
  };

  /** ✅ 엔터 키 입력 시 검색 실행 */
  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      if (type === "main") {
        handleSearch();
      } else if (type === "continent") {
        handleContinentSearch(e);
      }
    }
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

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <main className="pt-10">
      {/* ✅ 메인 배너 검색 */}
      <section className="relative bg-gray-900 h-[600px] overflow-hidden flex flex-col justify-center items-center">
        {/* 배경 이미지 */}
        <img
          src={mainImg}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="배경"
        />

        {/* 배너 타이틀 */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full max-w-6xl z-50 bg-transparent p-6">
          <h1 className="text-6x1 font-bold text-center text-white mt-20 mb-20">
            여울아~ 여행 코스 쒼나게 말아보자!!
          </h1>

          <div className="grid grid-flow-col auto-cols-[4.3fr_4fr_1fr_1fr] gap-4 flex items-end">
            {/* 여행 국가 입력 */}
            <div className="relative max-w-lg w-full" ref={searchResultsRef}>
              <label className="block text-sm font-medium text-white">
                여행 국가
              </label>

              <div className="relative w-full border border-gray-300 rounded-md shadow-sm cursor-pointer flex justify-between items-center">
                {/* 🔍 검색 아이콘 */}
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FaSearch className="text-white text-lg" />
                </div>

                {/* 🔹 여행 국가 검색 입력창 */}
                <input
                  type="text-white"
                  className="block w-full pl-10 pr-3 py-2 boder boder-white focus:outline-none bg-transparent placeholder-white cursor-pointer text-white"
                  placeholder="여행하고 싶은 나라, 도시를 입력하세요."
                  value={searchTerm || ""}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  onFocus={() => setShowResults(true)} // 🔹 포커스 시 자동완성 UI 열림
                />
                {/* ❌ X 버튼 (검색어 초기화) */}
                {searchTerm.length > 0 || selectedCity ? (
                  <div
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                    onClick={handleClearSearch}
                  >
                    <FaTimes className="text-white text-lg" />
                  </div>
                ) : null}
              </div>

              {/* 자동완성 UI (최근 검색어 + 추천 도시 + 인기 여행지 포함) */}
              {showResults && (
                <div className="absolute top-full left-0 mt-1 border border-white rounded-lg shadow-lg p-3 z-50 w-[700px] max-h-[220px] overflow-y-auto scrollbar-hide bg-transparent">
                  {/* 📌 최근 검색어 */}
                  {recentSearches.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-white mb-2">
                        최근 검색어
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {recentSearches.map((search, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white bg-orange-500 cursor-pointer"
                            onClick={() => handleCitySelect(search, "")}
                          >
                            {search?.search_term || search}
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
                  {searchTerm.trim().length > 0 ? (
                    suggestedCities && suggestedCities.length > 0 ? (
                      suggestedCities.map((item, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-orange-500 rounded-lg cursor-pointer"
                          onClick={() => {
                            handleCitySelect(item.description, "");
                            setShowResults(false);
                            console.log("🔍 선택된 도시:", item.description);
                          }}
                        >
                          <div className="font-medium text-white">
                            {item.description}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-white">검색 결과 없음</p>
                    )
                  ) : (
                    <>
                      {/* 📌 인기 여행지 */}
                      <h3 className="text-sm font-medium text-white">
                        인기 여행지
                      </h3>
                      <div className="grid grid-cols-5 grid-rows-2 gap-2">
                        {(popularDestinations || [])
                          .filter(destination => destination && destination.searchTerm) // ✅ null, undefined 방지
                          .map((destination, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 text-left font-medium text-white hover:text-white hover:bg-orange-500 rounded-lg cursor-pointer"
                              onClick={() => {
                                handlePopularDestinationSelect(destination.searchTerm); // ✅ 정확한 값 전달
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
              <label className="block text-sm font-medium text-white">
                여행 기간
              </label>
              <div className="relative">
                <i
                  className="far fa-calendar-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                ></i>

                <input
                  ref={datePickerRef}
                  className="block w-full pl-10 pr-3 py-2 text-white border boder-white bg-transparent placeholder-white rounded-md shadow-sm focus:ring-white focus:border-white cursor-pointer"
                  placeholder="여행 날짜를 선택하세요"
                  onClick={toggleDatePicker} // 📌 클릭 시 달력 토글
                  readOnly // 📌 키보드 입력 방지 (달력으로만 선택)
                  value={tripDuration || ""} // 📌 tripDuration 값을 input에 표시 (없을 때 빈 문자열)
                />
              </div>
            </div>

            {/* 인원 선택 */}
            <div className="relative">
              <label className="block text-sm font-medium text-white">
                인원수
              </label>

              {/* 인원 선택 버튼 */}
              <div
                className="relative w-[180.98px] max-w-[180.98px] border border-white px-3 py-2 rounded-md shadow-sm focus:ring-white focus:border-white cursor-pointer flex items-center gap-3"
                onClick={() => setIsPeopleOpen(!isPeopleOpen)}
              >
                <i className="fas fa-user text-white"></i>
                <span className="text-white">{adults}명</span>
                <i
                  className={`fas ${isPeopleOpen ? "fa-chevron-up" : "fa-chevron-down"
                    } text-white ml-auto`}
                ></i>
              </div>

              {/* 인원 선택 드롭다운 (absolute 적용) */}
              {isPeopleOpen && (
                <div className="absolute top-full left-0 mt-2 border border-gray-300 rounded-lg p-4 shadow-lg bg-white w-full z-50">
                  {/* 성인 선택 */}
                  <div className="flex justify-between items-center mb-3">
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

                  {/* 확인 버튼 */}
                  <button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
                    onClick={() => setIsPeopleOpen(false)}
                  >
                    확인
                  </button>
                </div>
              )}
            </div>

            {/* 확인 버튼 */}
            <div>
              <div className="relative">
                <label className="block text-sm font-medium text-white" />
                <div className="w-full border-orange-500 border-orange-500 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer flex justify-between items-center mt-3">
                  <button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
                    onClick={handlePlanTrip}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 나라 목록 */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">나라별 여행지</h2>

        {/* 🔹 검색 입력창 및 버튼 */}
        <div className="flex gap-2 mb-6 justify-left">
          <div className="flex border hover:border-orange-500 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="나라 검색"
              value={continentSearchText}
              onChange={(e) => setContinentSearchText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "continent")}
              className="p-2 w-64 border-none outline-none"
            />
            <button
              className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2"
              onClick={handleContinentSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* ✅ 나라 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {filteredContinents.length > 0 ? (
            filteredContinents.map((continent, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden group cursor-pointer transition-transform duration-200 transform hover:scale-105 shadow-md"
                onClick={() => handleClick(continent)}
              >
                <img
                  src={continent.image}
                  className="w-full h-56 object-cover rounded-t-lg"
                  alt={continent.name}
                />
                <div className="bg-white p-4 flex flex-col items-center rounded-b-lg">
                  <h3 className="text-lg font-bold text-gray-900">
                    {continent.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {continent.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">
              검색한 결과를 찾지 못했습니다.
            </p>
          )}
        </div>

        {/* ✅ 나라 상세 정보 모달 */}
        {selectedCountry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[500px] p-6 rounded-lg shadow-xl relative">

              {/* 닫기 버튼 */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCountry.name}
              </h2>
              <p className="text-gray-600">{selectedCountry.description}</p>

              {/* 나라 이미지 추가 */}
              <img
                src={selectedCountry.image}
                className="w-full h-40 object-cover rounded-md mt-3"
                alt={selectedCountry.name}
              />

              {/* 추가 정보 */}
              <div className="mt-4 space-y-2">
                {countryInfo ? (
                  <>
                    <p>
                      🌎 수도:{" "}
                      <strong>{countryInfo.capital?.[0] || "정보 없음"}</strong>
                    </p>
                    <p>
                      📍 지역:{" "}
                      <strong>{countryInfo.region || "정보 없음"}</strong>
                    </p>
                    <p>
                      🗣️ 언어:{" "}
                      <strong>
                        {" "}
                        {countryInfo.languages &&
                          Object.keys(countryInfo.languages).length > 0
                          ? Object.values(countryInfo.languages).join(", ")
                          : "정보 없음"}
                      </strong>
                    </p>
                    <p>
                      💰 화폐:{" "}
                      <strong>
                        {" "}
                        {countryInfo.currencies &&
                          Object.keys(countryInfo.currencies).length > 0
                          ? Object.values(countryInfo.currencies)
                            .map((c) => c.name)
                            .join(", ")
                          : "정보 없음"}{" "}
                      </strong>
                    </p>
                  </>
                ) : (
                  <p className="text-red-500 text-center font-semibold">
                    해당 국가에 대한 정보를 불러올 수 없습니다.
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                  onClick={handleCloseModal}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
