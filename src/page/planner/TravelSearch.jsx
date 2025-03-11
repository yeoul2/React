import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

// 📌 최근 검색어 및 인기 여행지 데이터
const recentSearches = ["도쿄", "파리"];
const popularDestinations = [
  "도쿄", "서울", "후쿠오카", "오사카", "베이징",
  "광저우", "부산", "제주", "방콕", "다낭"
];

// 📌 국가별 추천 도시 데이터
const cities = {
  "일본": ["도쿄", "오사카", "교토", "후쿠오카", "삿포로"],
  "프랑스": ["파리", "마르세유", "리옹", "보르도", "니스"],
  "미국": ["뉴욕", "로스앤젤레스", "시카고", "샌프란시스코", "라스베가스"],
  "이탈리아": ["로마", "밀라노", "베네치아", "피렌체", "나폴리"]
};

// 📌 `forwardRef`를 사용하여 `PlannerPage.js`에서 내부 메서드 호출 가능하게 설정
const TravelSearch = forwardRef(({ setCountry }, ref) => {
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 관리
  const [showResults, setShowResults] = useState(false); // 검색 결과 표시 여부 상태 관리
  const [selectedCity, setSelectedCity] = useState(""); // 선택된 도시
  const searchResultsRef = useRef(null); // 검색 결과 영역을 위한 참조

  // 📌 외부에서 검색 기능을 사용할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    getSuggestedCities: (term) => {
      if (!term) return [];

      // 검색어에 맞는 국가와 도시를 반환
      const matchedCountry = Object.keys(cities).find((country) => country.includes(term));
      if (matchedCountry) {
        return cities[matchedCountry].map((city) => ({ country: matchedCountry, city }));
      }
      return [];
    },
    getRecentSearches: () => recentSearches, // ✅ 최근 검색어 반환
    getPopularDestinations: () => popularDestinations, // ✅ 인기 여행지 반환
    getSearchTerm: () => searchTerm, // ✅ 현재 검색어 반환
    setSearchTerm: (term) => setSearchTerm(term), // ✅ 검색어 설정
  }));

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

  // 📌 검색어 변경
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0); // 검색어가 있을 때만 결과 표시
  };

  // 📌 추천 도시 목록을 동적으로 반환 (입력된 검색어 기준)
  const suggestedCities = () => {
    if (!searchTerm) return [];
    const matchedCountry = Object.keys(cities).find((country) => country.includes(searchTerm));

    // 국가별 도시와 그에 해당하는 국가를 반환
    return matchedCountry
      ? cities[matchedCountry].map((city) => ({ country: matchedCountry, city }))
      : [];
  };

  // 📌 검색어 초기화 (X 버튼 클릭 시)
  const handleClearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
    setSelectedCity(""); // 선택된 도시 초기화
  };

  // 📌 도시 선택 처리
  const handleCitySelect = (city, country) => {
    setSelectedCity(`${city}, ${country}`); // 선택된 도시를 유지
    setSearchTerm(`${city}, ${country}`); // 입력 필드에서도 유지
    setShowResults(false); // 검색 결과 닫기
    setCountry(city); // 상위 컴포넌트로 국가 설정
  };

  return (
    <div className="relative max-w-lg w-full" ref={searchResultsRef}>

      {/* 검색 입력 필드 */}
      <div className="relative">
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom cursor-pointer"
          placeholder="여행하고 싶은 나라나 도시를 입력하세요"
          value={searchTerm} // 항상 searchTerm을 표시
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(e.target.value.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && searchTerm.length === 0 && selectedCity) {
              // 백스페이스를 누르면 selectedCity도 함께 삭제
              setSelectedCity("");
            }
          }}
          onFocus={() => setShowResults(true)} // 포커스 시 결과 표시
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 text-lg" />
        </div>

        {/* X 버튼 추가 */}
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
            <h3 className="text-sm font-medium text-gray-500 mb-3">최근 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <span key={index} className="inline-flex justify-center items-center px-3 py-1 rounded-full text-sm text-white bg-orange-300">
                  {search} <FaTimes className="ml-2 text-gray-500 hover:text-white cursor-pointer" />
                </span>
              ))}
            </div>

            {/* 추천 도시 목록 */}
            <h3 className="text-sm font-medium text-gray-500 mb-3 mt-4">추천 도시</h3>
            {suggestedCities().length > 0 ? (
              suggestedCities().map(({ city, country }, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-orange-300 rounded-lg cursor-pointer group"
                  onClick={() => handleCitySelect(city, country)}
                >
                  {/* 도시와 국가를 하나의 div로 묶어서 호버 스타일을 적용 */}
                  <div className="flex flex-col">
                    <div className="font-medium group-hover:text-white">{city}</div>
                    <div className="text-sm text-gray-500 group-hover:text-white">{country}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">검색 결과 없음</p>
            )}

            {/* 인기 여행지 */}
            <h3 className="text-sm font-medium text-gray-500 mt-4 mb-3">인기 여행지</h3>
            <div className="flex flex-wrap gap-4 text-center">
              {popularDestinations.map((destination, index) => (
                <div key={index} className="w-1/1 px-4 py-2 text-center font-medium text-gray-900 hover:text-white hover:bg-orange-300 rounded-lg whitespace-nowrap cursor-pointer">
                  {destination}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TravelSearch;