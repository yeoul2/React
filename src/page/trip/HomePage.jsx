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
  const [country, setCountry] = useState(""); // ✅ 나라 정보 상태 추가
  const [adults, setAdults] = useState(2); // 📌 성인 인원 수
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 📌 달력 토글 상태
  const [isPeopleOpen, setIsPeopleOpen] = useState(false); // 인원 수 토글 상태
  const [continentSearchText, setContinentSearchText] = useState(""); // ✅ 나라 검색 상태
  const [filteredContinents, setFilteredContinents] = useState(continents);
  const [selectedCountry, setSelectedCountry] = useState(null); // 🔹 모달 상태 관리

  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null);

  // ✅ 커스텀 훅 적용
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
    handleSearchChange,
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
  const handlePlanTrip = () => {
    if (!selectedCity || dateRange.length < 2) {
      alert("도시와 여행 기간을 입력하세요.");
      return;
    }
    navigate(`/planner?city=${selectedCity}&start=${dateRange[0]}&end=${dateRange[1]}&adults=${adults}`);
  };

  /** ✅ 메인 배너 검색 (여행 코스 검색) */
  const handleSearch = () => {
    if (searchTerm.trim()) {
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
      window.location.href = `/course?search=${encodeURIComponent(searchTerm)}`;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 문제가 발생했습니다.");
    } */
  };

  // ✅ 나라 목록 검색
  const handleContinentSearch = () => {
    const filtered = continents.filter((continent) =>
      continent.name.includes(continentSearchText)
    );
    setFilteredContinents(filtered);
  };

  //** ✅ 나라 클릭 시 모달 표시
  const handleClick = (continent) => {
    console.log("선택된 나라:", continent); // 🔹 디버깅용 콘솔 로그 추가
    setSelectedCountry(continent); // 🔹 나라 클릭 시 모달 열기
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
        handleContinentSearch();
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


  return (
    <main className="pt-10">
      {/* ✅ 메인 배너 검색 */}
      <section className="relative bg-gray-900 h-[600px] overflow-hidden flex flex-col justify-center items-center text-white">
        {/* 배경 이미지 */}
        <img
          src={mainImg}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="배경"
        />

        {/* 배너 타이틀 */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50 bg-transparent p-6">
          <h1 className="text-4xl font-bold text-center z-10 mb-6">여울아~ 여행 코스 쒼나게 말아보자!!</h1>
          <h2 className="text-xl font-bold text-center z-10 mb-6">여행 정보 입력</h2>

            <div className="grid grid-cols-4 gap-4 sm:grid-cols-4">

              {/* 여행 국가 입력 */}
              <div className="relative max-w-lg w-full" ref={searchResultsRef}>
                <label className="block text-sm font-medium text-white">여행 국가</label>

                <div className="relative">
                  {/* 🔍 검색 아이콘 */}
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FaSearch className="text-white text-lg" />
                  </div>

                  {/* 🔹 여행 국가 검색 입력창 */}
                  <input
                    type="text-white"
                    className="block w-full pl-10 pr-10 py-2 boder-white bg-transparent text-white placeholder-white cursor-pointer"
                    placeholder="여행하고 싶은 나라나 도시를 입력하세요"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)} // 🔹 포커스 시 자동완성 UI 열림
                  />

                  {/* ❌ X 버튼 (검색어 초기화) */}
                  {searchTerm.length > 0 || selectedCity ? (
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
                    {searchTerm.length > 0 ? (
                      suggestedCities.length > 0 ? (
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
        </div>
      </section>

      {/* 나라 목록 */}
      <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8">나라별 여행지</h2>

        {/* 🔹 검색 입력창 및 버튼 */}
        <div className="flex gap-2 mb-6 justify-left">
          <div className="flex border rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="나라 검색"
              value={continentSearchText}
              onChange={(e) => setContinentSearchText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "continent")}
              className="p-2 w-64 border-none outline-none"
            />
            <button className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2" onClick={handleContinentSearch}>검색</button>
          </div>
        </div>

        {/* ✅ 나라 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {filteredContinents.length > 0 ? (
            filteredContinents.map((continent, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => handleClick(continent)}
              >
                <img src={continent.image} className="w-full h-48 object-cover" alt={continent.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white font-medium">{continent.name}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">검색한 결과를 찾지 못했습니다. <br /> 빠른 시일 내에 기능구현 하겠습니다. </p>
          )}
        </div>

        {/* 🔹 모달 창 */}
        {selectedCountry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md shadow-md w-80 relative">
              <h2 className="text-xl font-bold mb-2">{selectedCountry.name}</h2>
              <p className="mb-4">{selectedCountry.description}</p>
              <div className="flex justify-end"> {/* 버튼을 오른쪽으로 정렬 */}
                <button className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md" onClick={handleCloseModal}>확인</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main >
  );
};

export default HomePage;
