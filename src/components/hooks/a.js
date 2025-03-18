import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAutocomplete } from "../../services/googlePlacesService"; // ✅ API 호출 파일 불러오기
import debounce from "lodash.debounce"; // ✅ Debounce를 사용하여 API 요청 최적화
import {
  getRecentSearches,
  saveSearch,
  deleteRecentSearch,
  getPopularDestinations,
} from "../../services/travelSearchLogic";

// 🔽 커스텀 훅 생성
const useTravelSearch = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [suggestedCountries, setSuggestedCountries] = useState([]);
  const [suggestedCities, setSuggestedCities] = useState([]);

  const searchResultsRef = useRef(null);

  /**
   * 📌 하나의 함수로 국가, 도시, 상세 주소를 구분하여 검색하는 공통 함수
   *
   * @param {string} query 사용자가 입력한 검색어
   * @param {string} type 검색 타입: 'regions' | 'cities' | 'geocode'
   * @param {function} setSuggestions 결과값을 상태에 저장할 함수 (예: setSuggestedCountries)
   */
  const latestQueryRef = useRef(""); // ✅ 최신 검색어 추적 (불필요한 API 호출 방지)

  const fetchPlaces = async (query, type, setSuggestions) => {
    if (!query || typeof query !== "string" || query.trim() === "") return; // ✅ query가 유효한 문자열인지 체크

    latestQueryRef.current = query; // ✅ 최신 검색어 저장

    console.log("🔍 API 요청 시작 - 검색어:", query, "타입:", type);

    try {
      const results = await fetchAutocomplete(query, type); // ✅ googlePlacesApi.js에서 가져오기

      // ✅ 최신 검색어가 변경되지 않은 경우에만 상태 업데이트
      if (latestQueryRef.current === query) {
        setSuggestions(results);
      }
    } catch (error) {
      console.error("Google Places API 장소 검색 오류:", error);
    }
  };

  // ✅ 로그인 상태 감지 및 최근 검색어 불러오기
  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("user_id");

      if (accessToken && userId) {
        setIsLoggedIn(true);
        setCurrentUser({ id: userId });

        try {
          const data = await getRecentSearches(accessToken);
          setRecentSearches(data);
        } catch (error) {
          console.error("검색어 불러오기 실패:", error);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setRecentSearches([]);
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // ✅ 검색어 저장 (RESTful API 적용)
  const handleSaveSearch = async (searchTerm, searchType) => {
    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const updatedSearches = await saveSearch(
        searchTerm,
        searchType,
        accessToken
      );
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("검색어 저장 실패:", error);
    }
  };

  // ✅ 최근 검색어 삭제
  const handleRemoveRecentSearch = async (searchToRemove, searchType) => {
    if (!isLoggedIn) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const updatedSearches = await deleteRecentSearch(
        searchToRemove,
        searchType,
        accessToken
      );
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("검색어 삭제 실패:", error);
    }
  };

  // ✅ 인기 여행지 조회
  useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        const data = await getPopularDestinations();
        setPopularDestinations(data);
      } catch (error) {
        console.error("인기 여행지 불러오기 오류:", error);
      }
    };

    loadPopularDestinations();
  }, []);

  // 📌 검색어 입력 시 자동완성 처리
  const handleCountryChange = (query) => {
    if (!query?.trim()) return; // ✅ query가 유효한 문자열인지 확인

    setSearchTerm(query); // ✅ 입력 즉시 반영
    debounceFetchPlaces(query); // ✅ API 요청 실행 (Debounce 적용)
  };

  // 📌 Google Places API 연동 (Debounce 적용)
  const debounceFetchPlaces = useCallback(
    debounce(async (query) => {
      setShowResults(true);

      try {
        const results = await fetchAutocomplete(query, "regions");
        setSuggestedCountries(results);
      } catch (error) {
        console.error("❌ Google Places API 오류:", error);
      }
    }, 300),
    []
  );

  // 📌 나라 선택 시 해당 나라의 도시 목록 불러오기
  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setSearchTerm(country);
    setSuggestedCountries([]); // 🔹 자동완성 목록 초기화

    try {
      const results = await fetchAutocomplete(country, "cities");
      setSuggestedCities(results);
    } catch (error) {
      console.error("❌ 도시 목록 불러오기 오류:", error);
      setSuggestedCities([]);
    }
  };

  // 📌 도시 선택 핸들러 수정
  const handleCitySelect = async (city, country) => {
    const fullCity = `${city}, ${country}`;
    setSuggestedCities([]); // 🔹 자동완성 목록 초기화
    setSelectedCity(fullCity); // 🔹 선택된 도시 저장
    setSearchTerm(fullCity); // 🔹 검색창에 선택한 도시 입력
    setShowResults(false); // 🔹 선택 후 자동완성 닫기

    try {
      // ✅ RESTful API 호출 (비동기 실행)
      handleSaveSearch(fullCity, "city"); // `await` 제거하여 비동기 처리 최적화
    } catch (error) {
      console.error("❌ 검색어 저장 또는 업데이트 실패:", error);
    }
  };

  // 📌 최근 검색어 저장 (RESTful API 적용)
  const updateRecentSearches = async (
    search,
    searchType,
    setRecentSearches
  ) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // 🔹 로그인되지 않은 경우 실행 안 함

      // ✅ RESTful API 호출
      const updatedSearches = await saveSearch(search, searchType, accessToken);
      setRecentSearches(updatedSearches);

      console.log("✅ 최근 검색어 업데이트 완료:", search);
    } catch (error) {
      console.error("❌ 최근 검색어 업데이트 실패:", error);
    }
  };

  // ✅ 검색어 초기화
  const handleClearSearch = async () => {
    setSearchTerm(""); // ✅ 검색 입력창 초기화
    setShowResults(false); // ✅ 자동완성 창 닫기
    setSelectedCity(""); // ✅ 선택된 도시 초기화
    setSuggestedCities([]); // ✅ 추천 도시 목록 초기화

    if (isLoggedIn) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const updatedSearches = await getRecentSearches(accessToken);
        setRecentSearches(updatedSearches); // ✅ 서버 응답 후 검색어 목록 업데이트
      } catch (error) {
        console.error("❌ 최근 검색어 불러오기 실패:", error);
        setRecentSearches([]); // ✅ 서버 요청 실패 시 초기화
      }
    } else {
      setRecentSearches([]); // ✅ 로그인되지 않은 경우 초기화
    }
  };

  // ✅ 인기 여행지 선택 처리
  const handlePopularDestinationSelect = async (destination) => {
    setSearchTerm(destination);
    setSelectedCity(destination);
    setShowResults(false);

    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const updatedSearches = await saveSearch(
        destination,
        "city",
        accessToken
      );
      setRecentSearches(updatedSearches);

      console.log("✅ 인기 여행지 선택 및 검색어 저장 완료:", destination);
    } catch (error) {
      console.error("❌ 검색어 저장 실패:", error);
    }
  };

  // ✅ 검색창 외부 클릭 시 검색 결과 닫기
  const handleClickOutside = (event) => {
    if (
      searchResultsRef.current &&
      !searchResultsRef.current.contains(event.target)
    ) {
      setShowResults(false);
    }
  };

  const getSuggestedCities = () => {
    if (!searchTerm?.trim()) return []; // ✅ 검색어가 없거나 공백이면 빈 배열 반환

    // ✅ API에서 받은 데이터가 있으면 그대로 반환
    if (suggestedCities?.length) return suggestedCities;

    // 📌 기본 추천 도시 목록
    const fallbackCities = [
      { country: "대한민국", city: "서울" },
      { country: "일본", city: "도쿄" },
      { country: "미국", city: "뉴욕" },
      { country: "프랑스", city: "파리" },
      { country: "이탈리아", city: "로마" },
    ];

    // ✅ 검색어가 포함된 도시만 반환
    return fallbackCities.filter(({ city }) =>
      city.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  };

  return {
    isLoggedIn,
    currentUser,
    searchTerm,
    showResults,
    selectedCity,
    recentSearches,
    suggestedCities,
    popularDestinations,
    searchResultsRef,
    handleClearSearch,
    handlePopularDestinationSelect,
    handleRemoveRecentSearch,
    handleSaveSearch,
    handleClickOutside,
    getSuggestedCities,
  };
};

export default useTravelSearch;
