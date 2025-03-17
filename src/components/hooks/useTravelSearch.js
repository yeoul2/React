import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios"; // 🔹 백엔드 API 호출을 위한 axios 추가
import { fetchAutocomplete } from "../../services/googlePlacesService"; // ✅ API 호출 파일 불러오기
import debounce from "lodash.debounce"; // ✅ Debounce를 사용하여 API 요청 최적화

// 🔽 커스텀 훅 생성
const useTravelSearch = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 🔹 로그인 상태 확인
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 검색어 상태
  const [showResults, setShowResults] = useState(false); // 🔹 검색 결과 표시 여부
  const [currentUser, setCurrentUser] = useState(null); // 🔹 현재 로그인한 사용자 정보 저장 (user_id 값 보관)
  const [selectedCountry, setSelectedCountry] = useState(""); // 🔹 나라 선택 추가
  const [selectedCity, setSelectedCity] = useState(""); // 선택된 도시
  const [recentSearches, setRecentSearches] = useState([]); // 최근 검색어
  const [searchResults, setSearchResults] = useState([]); // 자동완성 결과
  const [popularDestinations, setPopularDestinations] = useState([]); // 🔹 인기 여행지
  const [suggestedCountries, setSuggestedCountries] = useState([]); // 🔹 나라 자동완성 결과
  const [suggestedCities, setSuggestedCities] = useState([]); // 🔹 도시 자동완성 결과

  const searchResultsRef = useRef(null); // 🔹 검색 결과 영역 참조

  // 📌 로그인 상태 감지 및 최근 검색어 불러오기 (DB에서)
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("user_id");
      if (accessToken && userId) {
        setIsLoggedIn(true);
        setCurrentUser({ id: userId });

        // ✅ 🔹 로그인한 경우 DB에서 최근 검색어 불러오기
        axios
          .get(`/api/search/recent-list`)
          .then((response) => setRecentSearches(response.data))
          .catch((error) => console.error("검색어 불러오기 실패:", error));
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setRecentSearches([]); // 🔹 로그아웃 시 검색어 초기화
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // ✅ 검색어 저장 함수 추가 (백엔드 연동)
  const saveSearch = async (searchTerm, searchType) => {
    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return;
    }

    try {
      // ✅ 백엔드 변경된 API 엔드포인트에 맞춰 요청
      await axios.post(`/api/search/recent-save`, null, {
        params: { searchTerm, searchType }, // 🔹 @RequestParam 방식으로 전달
      });

      // ✅ 🔹 저장 후 최신 검색어 목록을 가져와 업데이트
      const response = await axios.get(`/api/search/recent-list`);
      setRecentSearches(response.data);

      console.log("✅ 검색어 저장 완료:", searchTerm, searchType);
    } catch (error) {
      console.error("❌ 검색어 저장 실패:", error);
    }
  };

  // ✅ 최근 검색어 삭제 함수 (DB에서 삭제)
  const handleRemoveRecentSearch = async (searchToRemove, searchType) => {
    if (!isLoggedIn) return;

    try {
      // ✅ 백엔드 API 호출 (RequestParam 방식)
      await axios.delete(`/api/search/recent-delete`, {
        params: { searchTerm: searchToRemove, searchType }, // 🔹 @RequestParam 방식으로 전달
      });

      // ✅ 삭제 후 최신 검색어 목록 가져오기
      const response = await axios.get(`/api/search/recent-list`);
      setRecentSearches(response.data);

      console.log("✅ 검색어 삭제 완료:", searchToRemove);
    } catch (error) {
      console.error("❌ 검색어 삭제 실패:", error);
    }
  };

  // 📌 인기 여행지 조회
  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        const response = await axios.get("/api/search/popular-list");
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

  // 📌 검색어 입력 시 자동완성 처리
  const handleCountryChange = (query) => {
    if (!query || typeof query !== "string") return; // ✅ query가 문자열인지 확인

    setSearchTerm(query); // ✅ 입력 즉시 반영
    debounceFetchPlaces(query); // ✅ API 요청만 `debounce` 적용
  };

  const debounceFetchPlaces = useCallback(
    debounce(async (query) => {
      if (!query.trim()) return;

      setShowResults(true);
      try {
        const results = await fetchAutocomplete(query, "regions");
        setSuggestedCountries(results);
      } catch (error) {
        console.error("Google Places API 오류:", error);
      }
    }, 300),
    []
  );

  // 📌 나라 선택 시 해당 나라의 도시 목록 불러오기
  const handleCountrySelect = async (country) => {
    setSelectedCountry(country); // 🔹 사용자가 선택한 나라를 상태로 저장
    setSearchTerm(country); // 🔹 검색 입력창을 선택한 나라로 변경
    setSuggestedCountries([]); // 🔹 자동완성 목록을 초기화 (선택 후 목록 숨김)

    try {
      const results = await fetchAutocomplete(country, "cities"); // ✅ API 호출 변경

      if (results.length > 0) {
        setSuggestedCities(results);
      } else {
        setSuggestedCities([]); // 🔹 검색 결과가 없는 경우 목록 초기화
      }
    } catch (error) {
      console.error("도시 목록 불러오기 오류:", error);
      setSuggestedCities([]); // 🔹 오류 발생 시 목록 초기화
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
      // ✅ 🔹 검색어 저장 (searchType을 "city"로 설정)
      await saveSearch(fullCity, "city");

      // ✅ 🔹 저장 후 최신 검색어 목록을 다시 불러와 업데이트
      const response = await axios.get(`/api/recent-searches`);
      setRecentSearches(response.data);
    } catch (error) {
      console.error("❌ 검색어 저장 또는 업데이트 실패:", error);
    }
  };

  // 📌 최근 검색어 저장 (DB에서 관리)
  const updateRecentSearches = async (search, searchType) => {
    if (!isLoggedIn) return; // 🔹 로그인하지 않은 경우 저장 안 함

    try {
      // ✅ 검색어를 백엔드에 저장
      await axios.post(`/api/search/saveRecent`, null, {
        params: { searchTerm: search, searchType }, // 🔹 @RequestParam 방식으로 전달
      });

      // ✅ 저장 후 최신 검색어 목록을 다시 가져와서 상태 업데이트
      const response = await axios.get(`/api/recent-searches`);
      setRecentSearches(response.data);

      console.log("✅ 최근 검색어 업데이트 완료:", search);
    } catch (error) {
      console.error("❌ 최근 검색어 업데이트 실패:", error);
    }
  };

  // ✅ 검색어 초기화 (최근 검색어 목록도 고려하여 처리)
  const handleClearSearch = () => {
    setSearchTerm(""); // 🔹 검색어 입력란을 비움
    setShowResults(false); // 🔹 자동완성 목록을 닫음
    setSelectedCity(""); // 🔹 선택된 도시를 초기화
    setSuggestedCities([]); // 🔹 자동완성 목록을 초기화
    setRecentSearches([]); // ✅ 🔹 최근 검색어 목록도 초기화 (isLoggedIn 상태 감지하여 유지)

    if (isLoggedIn) {
      // ✅ 로그인한 경우, 서버에서 최신 최근 검색어 목록을 다시 가져와서 반영
      axios
        .get(`/api/recent-searches`)
        .then((response) => setRecentSearches(response.data))
        .catch((error) =>
          console.error("❌ 최근 검색어 불러오기 실패:", error)
        );
    }
  };

  // 📌 인기 여행지 선택 처리 (검색어 저장)
  const handlePopularDestinationSelect = async (destination) => {
    setSearchTerm(destination);
    setSelectedCity(destination);
    setShowResults(false);

    if (!isLoggedIn) {
      console.log("❌ 로그인되지 않음 - 검색어 저장 안 함");
      return; // 📌 로그인하지 않으면 저장하지 않음
    }

    try {
      // ✅ 검색어를 백엔드에 저장
      await axios.post(`/api/search/saveRecent`, null, {
        params: { searchTerm: destination, searchType: "city" }, // 🔹 @RequestParam 방식으로 전달
      });

      // ✅ 저장 후 최신 검색어 목록을 다시 가져와서 상태 업데이트
      const response = await axios.get(`/api/recent-searches`);
      setRecentSearches(response.data);

      console.log("✅ 인기 여행지 선택 및 검색어 저장 완료:", destination);
    } catch (error) {
      console.error("❌ 검색어 저장 실패:", error);
    }
  };

  // 📌 검색창 외부 클릭 시 검색 결과 닫기 (검색창이 열려 있을 때만 실행)
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
    if (!searchTerm) return []; // ✅ 빈 값이면 아무것도 반환하지 않음 (공백 검색 방지)

    if (suggestedCities.length > 0) {
      return suggestedCities; // ✅ API에서 받은 데이터가 있으면 사용
    }

    // 📌 API 응답이 없거나 실패한 경우, 기본 데이터 제공
    const fallbackCities = [
      { country: "대한민국", city: "서울" },
      { country: "일본", city: "도쿄" },
      { country: "미국", city: "뉴욕" },
      { country: "프랑스", city: "파리" },
      { country: "이탈리아", city: "로마" },
    ];

    // ✅ 검색어 1글자도 검색 가능하도록 변경
    return fallbackCities.filter(({ city }) =>
      city.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  };

  return {
    isLoggedIn, // 🔹 로그인 여부 추가
    currentUser, // 🔹 현재 로그인한 사용자 정보 추가
    searchTerm, // 🔹 검색어 상태
    showResults, // 🔹 검색 결과 표시 여부
    selectedCity, // 🔹 선택된 도시
    recentSearches, // 🔹 최근 검색어 목록
    suggestedCities, // 🔹 추천 도시 목록
    popularDestinations, // 🔹 인기 여행지 목록
    searchResultsRef, // 🔹 검색 결과 DOM 참조
    handleCountryChange, // 🔹 나라 입력 시 자동완성 처리
    fetchPlaces, // 🔹 공통 검색 함수
    saveSearch, // 🔹 검색어 저장 함수 (백엔드 API 호출)
    setSearchTerm, // 🔹 검색어 변경 함수
    setShowResults, // 🔹 검색 결과 표시 여부 설정
    handleClearSearch, // 🔹 검색어 초기화
    handleCitySelect, // 🔹 도시 선택 처리
    handleCountrySelect, // 🔹 나라 선택 처리
    handlePopularDestinationSelect, // 🔹 인기 여행지 선택 처리
    handleClickOutside, // 🔹 검색창 외부 클릭 시 닫기
    getSuggestedCities, // 🔹 도시 추천 기능 (더미 데이터 + API 사용)
    handleRemoveRecentSearch, // 🔹 최근 검색어 삭제
    updateRecentSearches, // 🔹 최근 검색어 업데이트
  };
};

export default useTravelSearch;
