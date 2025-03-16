import { useState, useEffect, useRef } from "react";
import axios from "axios"; // 🔹 백엔드 API 호출을 위한 axios 추가
import { fetchAutocomplete } from "../../services/googlePlacesService"; // ✅ API 호출 파일 불러오기

// 🔽 커스텀 훅 생성
const useTravelSearch = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [showResults, setShowResults] = useState(false); // 검색 결과 표시 여부
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(""); // 🔹 나라 선택 추가
  const [selectedCity, setSelectedCity] = useState(""); // 선택된 도시
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  ); // 최근 검색어
  const [searchResults, setSearchResults] = useState([]); // 자동완성 결과
  const [popularDestinations, setPopularDestinations] = useState([]); // 🔹 인기 여행지
  const [suggestedCountries, setSuggestedCountries] = useState([]); // 🔹 나라 자동완성 결과
  const [suggestedCities, setSuggestedCities] = useState([]); // 🔹 도시 자동완성 결과

  const searchResultsRef = useRef(null); // 검색 결과 영역 참조

  // 📌 로그인 상태 감지
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("user_id");
      if (accessToken && userId) {
        setIsLoggedIn(true);
        setCurrentUser({ id: userId });
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkLoginStatus(); // 📌 페이지 로드 시 로그인 상태 확인
    window.addEventListener("storage", checkLoginStatus); // 📌 로그인 변경 감지
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // 📌 인기 여행지 불러오기 (API 연동)
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        const response = await axios.get("/api/search/popular");
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setPopularDestinations(response.data);
        } else {
          console.warn("인기 여행지 데이터가 비어있거나 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("인기 여행지 불러오기 오류:", error);
      }
    };
    fetchPopularDestinations();
  }, []);

  /**
   * 📌 하나의 함수로 국가, 도시, 상세 주소를 구분하여 검색하는 공통 함수
   *
   * @param {string} query 사용자가 입력한 검색어
   * @param {string} type 검색 타입: 'regions' | 'cities' | 'geocode'
   * @param {function} setSuggestions 결과값을 상태에 저장할 함수 (예: setSuggestedCountries)
   */
  const fetchPlaces = async (query, type, setSuggestions) => {
    if (!query) return;

    console.log("🔍 API 요청 시작 - 검색어:", query, "타입:", type);

    try {
      const results = await fetchAutocomplete(query, type); // ✅ googlePlacesApi.js에서 가져오기
      setSuggestions(results);
    } catch (error) {
      console.error("Google Places API 장소 검색 오류:", error);
    }
  };

  // 📌 검색어 입력 시 자동완성 처리
  const handleCountryChange = async (e) => {
    const query = e.target.value;
    setSearchTerm(query); // 🔹 사용자가 입력한 검색어를 상태에 저장
    setShowResults(true); // 🔹 자동완성 목록을 화면에 표시

    const results = await fetchAutocomplete(query, "regions"); // ✅ API 호출 변경
    setSuggestedCountries(results);
  };

  // 📌 나라 선택 시 해당 나라의 도시 목록 불러오기
  const handleCountrySelect = async (country) => {
    setSelectedCountry(country); // 🔹 사용자가 선택한 나라를 상태로 저장
    setSearchTerm(country); // 🔹 검색 입력창을 선택한 나라로 변경
    setSuggestedCountries([]); // 🔹 자동완성 목록을 초기화 (선택 후 목록 숨김)
    
    const results = await fetchAutocomplete(country, "cities"); // ✅ API 호출 변경
    setSuggestedCities(results);
  };

  // 📌 도시 선택 핸들러 수정
  const handleCitySelect = async (city, country) => {
    const fullCity = `${city}, ${country}`;
    setSuggestedCities([]); // 🔹 자동완성 목록 초기화
    setSelectedCity(fullCity); // 🔹 선택된 도시 저장
    setSearchTerm(fullCity); // 🔹 검색창에 선택한 도시 입력
    setShowResults(false); // 🔹 선택 후 자동완성 닫기

    // 🔹 최근 검색어 업데이트 추가
    updateRecentSearches(fullCity);

    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return;
    }

    try {
      // 📌 로그인한 경우 DB에도 검색어 저장
      await axios.post("/api/search/save", {
        userId: currentUser.id,
        searchTerm: fullCity,
      });
    } catch (error) {
      console.error("검색어 저장 실패:", error);
    }
  };

  // 📌 검색어 업데이트 (로그인한 사용자만 저장)
  const updateRecentSearches = (search) => {
    if (!isLoggedIn) return; // 🔹 로그인하지 않은 경우 저장 안 함

    setRecentSearches((prev) => {
      const updated = [search, ...prev.filter((item) => item !== search)].slice(
        0,
        10
      );
      localStorage.setItem(
        `recentSearches_${currentUser.id}`,
        JSON.stringify(updated)
      ); // 🔹 사용자별 검색어 저장
      return updated;
    });
  };

  // 📌 검색어 초기화
  const handleClearSearch = () => {
    setSearchTerm(""); // 🔹 검색어 입력란을 비움
    setShowResults(false); // 🔹 자동완성 목록을 닫음
    setSelectedCity(""); // 🔹 선택된 도시를 초기화
    setSuggestedCities([]); // 🔹 자동완성 목록을 초기화
  };

  // 📌 최근 검색어 삭제 기능 추가
  const handleRemoveRecentSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter(
      (search) => search !== searchToRemove
    );
    setRecentSearches(updatedSearches);

    // 🔹 로그인한 경우 사용자별 검색어 삭제
    if (isLoggedIn) {
      localStorage.setItem(
        `recentSearches_${currentUser.id}`,
        JSON.stringify(updatedSearches)
      );
    } else {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };

  // 📌 인기 여행지 선택 처리 (검색어 저장)
  const handlePopularDestinationSelect = async (destination) => {
    setSearchTerm(destination);
    setSelectedCity(destination);
    setShowResults(false);
    updateRecentSearches(destination);

    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return; // 📌 로그인하지 않으면 저장하지 않음
    }

    // 📌 로그인한 경우 검색어를 DB에 저장
    try {
      await axios.post("/api/search/save", {
        userId: currentUser.id,
        searchTerm: destination,
      });
    } catch (error) {
      console.error("검색어 저장 실패:", error);
    }
  };

  // 📌 검색창 외부 클릭 시 검색 결과 닫기
  const handleClickOutside = (event) => {
    if (
      searchResultsRef.current &&
      !searchResultsRef.current.contains(event.target)
    ) {
      setShowResults(false);
    }
  };

  // 📌 ✅ 도시 추천 기능 (API 기반, 필요시 기본 더미 데이터 제공)
  const getSuggestedCities = () => {
    if (!searchTerm) return [];

    if (suggestedCities.length > 0) {
      return suggestedCities; // ✅ API에서 받은 데이터가 있으면 사용
    }

    // 📌 API 응답이 없거나 실패한 경우, 기본 데이터 제공 (선택 사항)
    const fallbackCities = [
      { country: "대한민국", city: "서울" },
      { country: "일본", city: "도쿄" },
      { country: "미국", city: "뉴욕" },
      { country: "프랑스", city: "파리" },
      { country: "이탈리아", city: "로마" },
    ];

    return fallbackCities.filter(({ city }) => city.includes(searchTerm));
  };

  /*   // 📌 ✅ 도시 추천 기능 (API 데이터만 활용, 더미 데이터 제거)
const getSuggestedCities = () => {
  if (!searchTerm) return [];

  return suggestedCities.length > 0
    ? suggestedCities // ✅ API에서 받은 데이터가 있으면 사용
    : []; // ✅ API 데이터가 없으면 빈 배열 반환
}; 
*/

  return {
    fetchPlaces, // 🔹 공통 검색 함수
    isLoggedIn, // 🔹 로그인 여부 추가
    currentUser, // 🔹 현재 로그인한 사용자 정보 추가
    searchTerm, // 🔹 검색어 상태
    showResults, // 🔹 검색 결과 표시 여부
    selectedCity, // 🔹 선택된 도시
    recentSearches, // 🔹 최근 검색어 목록
    suggestedCities, // 🔹 추천 도시 목록
    popularDestinations, // 🔹 인기 여행지 목록
    searchResultsRef, // 🔹 검색 결과 DOM 참조
    setShowResults, // 🔹 검색 결과 표시 여부 설정
    handleCountryChange, // 🔹 나라 입력 시 자동완성 처리
    handleClearSearch, // 🔹 검색어 초기화
    handleCitySelect, // 🔹 도시 선택 처리
    handleCountrySelect, // 🔹 나라 선택 처리
    handlePopularDestinationSelect, // 🔹 인기 여행지 선택 처리
    handleClickOutside, // 🔹 검색창 외부 클릭 시 닫기
    getSuggestedCities, // 🔹 도시 추천 기능 (더미 데이터 + API 사용)
    handleRemoveRecentSearch, // 🔹 최근 검색어 삭제
  };
};

export default useTravelSearch;
