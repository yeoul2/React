import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import axios from "axios";  // 🔹 백엔드 API 호출을 위한 axios 추가

/// 🔹 API 연동 전까지는 빈 배열로 초기화
const initialRecentSearches = [];  // 최근 검색어 더미 데이터 제거
const initialPopularDestinations = [];  // 인기 여행지 더미 데이터 제거


// 📌 국가별 추천 도시 데이터
const cities = {
  "일본": ["도쿄", "오사카", "교토", "후쿠오카", "삿포로"],
  "프랑스": ["파리", "마르세유", "리옹", "보르도", "니스"],
  "미국": ["뉴욕", "로스앤젤레스", "시카고", "샌프란시스코", "라스베가스"],
  "이탈리아": ["로마", "밀라노", "베네치아", "피렌체", "나폴리"]
};

// 📌 `forwardRef`를 사용하여 `PlannerPage.js`에서 내부 메서드 호출 가능하게 설정
const TravelSearch = forwardRef(({ setCountry, isLoggedIn, currentUser }, ref) => {
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 관리
  const [showResults, setShowResults] = useState(false); // 검색 결과 표시 여부 상태 관리
  const [selectedCity, setSelectedCity] = useState(""); // 선택된 도시
  const [recentSearches, setRecentSearches] = useState(initialRecentSearches); // 최근 검색어 상태 관리
  const [popularDestinations, setPopularDestinations] = useState(initialPopularDestinations); // 🔹 인기 여행지 상태 추가
  const [suggestedCities, setSuggestedCities] = useState([]); // 🔹 구글 플레이스 API 결과 저장
  const searchResultsRef = useRef(null); // 검색 결과 영역을 위한 참조

  // 📌 외부에서 검색 기능을 사용할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    getRecentSearches: () => recentSearches,
    getPopularDestinations: () => popularDestinations,
    getSearchTerm: () => searchTerm,
    setSearchTerm: (term) => setSearchTerm(term),
  }));

  // 📌 구글 플레이스 API 호출 (자동완성 기능)
  const fetchGooglePlaces = async (query) => {
    if (!query) return;

    try {
      const response = await axios.get(`/api/search/places?query=${query}`);
      if (response.data.predictions) {
        setSuggestedCities(
          response.data.predictions.map((place) => ({
            city: place.structured_formatting.main_text,
            country: place.structured_formatting.secondary_text,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching Google Places API:", error);
    }
  };

  // 📌 도시 추천 기능 (국가 + 개별 도시 검색 가능)
  const getSuggestedCities = () => {
    if (!searchTerm) return [];

    // 🔹 검색어가 국가명과 일치하는 경우 → 해당 국가의 도시 리스트 반환
    const matchedCountry = Object.keys(cities).find((country) => country.includes(searchTerm));

    // 🔹 검색어가 개별 도시명과 일치하는 경우 → 해당 도시 반환
    const matchedCities = Object.entries(cities)
      .flatMap(([country, cityList]) => cityList.map(city => ({ country, city })))
      .filter(({ city }) => city.includes(searchTerm));

    return matchedCountry
      ? cities[matchedCountry].map(city => ({ country: matchedCountry, city }))
      : matchedCities;
  };

  // 📌 검색창 외부 클릭 시 검색 결과 닫기
  const handleClickOutside = (event) => {
    if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 📌 검색어 변경 (구글 API 연동)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
    fetchGooglePlaces(e.target.value); // 🔹 검색어 입력 시 구글 API 호출
  };

  // 📌 검색어 초기화
  const handleClearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
    setSelectedCity("");
  };

  // 📌 도시 선택 처리 (검색어 저장)
  const handleCitySelect = (city, country) => {
    setSelectedCity(`${city}, ${country}`);
    setSearchTerm(`${city}, ${country}`);
    setShowResults(false);
    setCountry(city);
    updateRecentSearches(city);

    // 🔹 API 연동 전, 로컬스토리지에 검색 기록 저장
    if (isLoggedIn) {
      const savedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
      const newSearches = [city, ...savedSearches.filter((item) => item !== city)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    }
  };


  // 📌 인기 여행지 선택 처리 (검색어 저장)
  const handlePopularDestinationSelect = async (destination) => {
    setSearchTerm(destination);
    setSelectedCity(destination);
    setShowResults(false);
    setCountry(destination);
    updateRecentSearches(destination);

    if (isLoggedIn) { // 🔹 로그인한 경우만 검색어 저장
      await axios.post("/api/search/save", {
        userId: currentUser.id,
        searchTerm: destination,
      });
    }
  };

  // 📌 최근 검색어 업데이트
  const updateRecentSearches = (search) => {
    setRecentSearches((prevSearches) => {
      const updatedSearches = [search, ...prevSearches.filter((item) => item !== search)];
      return updatedSearches.slice(0, 5);
    });

    // 🔹 API 연동 전, 최근 검색어를 로컬스토리지에 저장하도록 변경
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  };

  // 📌 앱이 처음 로드될 때 로컬스토리지에서 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (savedSearches) {
      setRecentSearches(savedSearches);
    }
  }, []);


  // 📌 인기 여행지 자동 업데이트 (사용자 검색 데이터를 반영)
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        // 🔹 API가 아직 연동되지 않았으므로 더미 데이터 주석 처리
        /*
        const response = await axios.get("/api/search/popular");
        if (response.data.length > 0) {
          setPopularDestinations(response.data);
        }
        */

        // 📌 임시 더미 데이터 (실제 API 연동 후 제거 예정)
        setPopularDestinations([
          "도쿄", "서울", "후쿠오카", "오사카", "베이징"
        ]);
      } catch (error) {
        console.error("Error fetching popular destinations:", error);
      }
    };

    fetchPopularDestinations();
  }, []);

  // 📌 최근 검색어 삭제 기능
  const handleRemoveRecentSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter((search) => search !== searchToRemove);
    setRecentSearches(updatedSearches);

    // 🔹 로컬스토리지에서도 삭제
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };


  return (
    <div className="relative max-w-lg w-full" ref={searchResultsRef}>
      {/* 검색 입력 필드 */}
      <div className="relative">
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer"
          placeholder="여행하고 싶은 나라나 도시를 입력하세요"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 text-lg" />
        </div>

        {/* X 버튼 */}
        {searchTerm.length > 0 || selectedCity ? (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={handleClearSearch}
          >
            <FaTimes className="text-gray-400 text-lg" />
          </div>
        ) : null}
      </div>

      {/* 검색 결과 목록 */}
      {showResults && (
        <div className="absolute w-full bg-white mt-2 rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            {/* 최근 검색어 */}
            {searchTerm.length === 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-500 mb-3">최근 검색어</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white bg-orange-300 cursor-pointer"
                      >
                        {search}
                        <FaTimes
                          className="ml-2 text-gray-500 hover:text-white cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveRecentSearch(search)
                          }}
                        />
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">최근 검색어 없음</p>
                  )}
                </div>
              </>
            )}

            {/* 검색어 입력 중에는 추천 도시 숨기고, 검색 결과만 표시 */}
            {searchTerm.length > 0 ? (
              getSuggestedCities().length > 0 ? (
                getSuggestedCities().map(({ city, country }, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-orange-300 rounded-lg cursor-pointer group"
                    onClick={() => handleCitySelect(city, country)}
                  >
                    <div className="flex flex-col">
                      <div className="font-font-medium  group-hover:text-white">{city}</div>
                      <div className="text-sm text-gray-500 group-hover:text-white">{country}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">검색 결과 없음</p>
              )
            ) : (
              <>
                {/* 추천 도시 (검색어가 없을 때 표시) */}
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-3">인기 여행지</h3>
                <div className="flex flex-wrap gap-4">
                  {popularDestinations.map((destination, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-center font-medium text-gray-900 hover:text-white hover:bg-orange-300 rounded-lg cursor-pointer"
                      onClick={() => handlePopularDestinationSelect(destination)}
                    >
                      {destination}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TravelSearch;