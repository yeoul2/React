import { useState, useEffect, useRef } from "react";
import axios from "axios"; // 🔹 백엔드 API 호출을 위한 axios 추가

// 📌 국가별 추천 도시 데이터
const cities = {
  대한민국: ["서울", "부산", "제주도", "대구", "광주"],
  일본: ["도쿄", "오사카", "교토", "후쿠오카", "삿포로"],
  프랑스: ["파리", "마르세유", "리옹", "보르도", "니스"],
  미국: ["뉴욕", "로스앤젤레스", "시카고", "샌프란시스코", "라스베가스"],
  이탈리아: ["로마", "밀라노", "베네치아", "피렌체", "나폴리"],
};

// 🔽 커스텀 훅 생성
const useTravelSearch = (isLoggedIn, currentUser) => {
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태 관리
  const [selectedCity, setSelectedCity] = useState(""); // 선택된 도시
  const [showResults, setShowResults] = useState(false); // 검색 결과 표시 여부 상태 관리
  const [recentSearches, setRecentSearches] = useState([]); // 최근 검색어 상태 관리
  const [popularDestinations, setPopularDestinations] = useState([]); // 🔹 인기 여행지 상태 추가
  const [suggestedCities, setSuggestedCities] = useState([]); // 🔹 구글 플레이스 API 결과 저장
  const searchResultsRef = useRef(null); // 검색 결과 영역을 위한 참조

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
      console.error("Google Places API 호출 오류:", error);
    }
  };

  // 📌 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
    fetchGooglePlaces(e.target.value); // 🔹 검색어 입력 시 구글 API 호출
  };

  // 📌 검색어 초기화
  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCity("");
    setShowResults(false);
  };

  // 📌 도시 선택 처리
  const handleCitySelect = (city, country) => {
    setSelectedCity(`${city}, ${country}`);
    setSearchTerm(`${city}, ${country}`);
    setShowResults(false);
    updateRecentSearches(city);

    // 🔹 API 연동 전, 로컬스토리지에 검색 기록 저장
    if (isLoggedIn) {
      const savedSearches =
        JSON.parse(localStorage.getItem("recentSearches")) || [];
      const newSearches = [
        city,
        ...savedSearches.filter((item) => item !== city),
      ].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    }
    return city; // 🔹 선택된 도시 반환
  };

  // 📌 인기 여행지 선택 처리 (검색어 저장)
  const handlePopularDestinationSelect = async (destination) => {
    setSearchTerm(destination);
    setSelectedCity(destination);
    setShowResults(false);
    updateRecentSearches(destination);

    if (isLoggedIn) {
      // 🔹 로그인한 경우만 검색어 저장
      await axios.post("/api/search/save", {
        userId: currentUser.id,
        searchTerm: destination,
      });
    }
    return destination; // 🔹 선택된 도시 반환
  };

  // 📌 최근 검색어 업데이트
  const updateRecentSearches = (search) => {
    setRecentSearches((prevSearches) => {
      const updatedSearches = [
        search,
        ...prevSearches.filter((item) => item !== search),
      ];
      return updatedSearches.slice(0, 5);
    });
    // 🔹 API 연동 전, 최근 검색어를 로컬스토리지에 저장하도록 변경
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  };

  // 📌 최근 검색어 삭제 기능
  const handleRemoveRecentSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter(
      (search) => search !== searchToRemove
    );
    setRecentSearches(updatedSearches);
    // 🔹 로컬스토리지에서도 삭제
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // 📌 도시 추천 기능 (국가 + 개별 도시 검색 가능)
  const getSuggestedCities = () => {
    if (!searchTerm) return [];

    // 🔹 검색어가 국가명과 일치하는 경우 → 해당 국가의 도시 리스트 반환
    const matchedCountry = Object.keys(cities).find((country) =>
      country.includes(searchTerm)
    );

    // 🔹 검색어가 개별 도시명과 일치하는 경우 → 해당 도시 반환
    const matchedCities = Object.entries(cities)
      .flatMap(([country, cityList]) =>
        cityList.map((city) => ({ country, city }))
      )
      .filter(({ city }) => city.includes(searchTerm));

    return matchedCountry
      ? cities[matchedCountry].map((city) => ({
          country: matchedCountry,
          city,
        }))
      : matchedCities;
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
          "도쿄",
          "서울",
          "후쿠오카",
          "오사카",
          "베이징",
        ]);
      } catch (error) {
        console.error("Error fetching popular destinations:", error);
      }
    };
    fetchPopularDestinations();
  }, []);

  return {
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
    handlePopularDestinationSelect,
    handleRemoveRecentSearch, // ✅ 추가됨
    getSuggestedCities, // ✅ 추가됨
  };
};

export default useTravelSearch;
