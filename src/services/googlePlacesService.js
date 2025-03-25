import axios from "axios";

let cancelTokenSource = null; // ✅ API 요청 취소 기능 추가

/**
 * 🔹 1. 자동완성 검색 (Place Autocomplete)
 * @param {string} query - 사용자 입력
 * @param {string} type - 검색 유형 ('regions' | 'cities' | 'geocode'), 기본값: 'geocode'
 * @returns {Promise<Array<string>>} - 자동완성된 장소 목록
 */
export const fetchAutocomplete = async (query = "geocode") => {
  if (!query.trim()) return []; // 🔹 빈 입력 방지

  // ✅ 기존 요청 취소 (빠르게 입력하는 경우)
  if (cancelTokenSource) {
    cancelTokenSource.cancel("🔄 새로운 요청으로 인해 이전 요청 취소됨");
  }
  cancelTokenSource = axios.CancelToken.source();

  try {
    const response = await axios.get("/api/places/autocomplete", {
      params: { input: query },
      cancelToken: cancelTokenSource.token, // ✅ 취소 토큰 추가
    });

    console.log("✅ 자동완성 응답:", response.data);

    return Array.isArray(response.data)
      ? response.data.filter((item) => {
          const desc = item.description?.toLowerCase();
          const queryLower = query.toLowerCase();

          // 1. description이 undefined면 제외
          if (!desc) return false;

          // 2. '중국', '일본'처럼 정확히 포함된 국가명만 필터링
          const exactMatch = desc === queryLower;
          const startsWith = desc.startsWith(queryLower + " ");
          const containsAsWord = desc.includes(" " + queryLower + " ");

          return exactMatch || startsWith || containsAsWord;
        })
      : [];
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("🚨 자동완성 요청이 취소됨:", error.message);
    } else {
      console.error("❌ 자동완성 API 호출 오류:", error);
    }
    return [];
  }
};

/**
 * 🔹 2. 특정 위치 주변 검색 (Nearby Search)
 */
export const fetchNearbyPlaces = async (location, type, radius = 5000) => {
  try {
    const response = await axios.get("/api/places/nearby_search", {
      params: { location, radius, type },
    });

    return response.data.results || [];
  } catch (error) {
    console.error("❌ 장소 검색 API 호출 오류:", error);
    return [];
  }
};

/**
 * 🔹 3. 장소 상세 정보 조회 (Place Details)
 */
export const fetchPlaceDetails = async (place_id) => {
  try {
    const response = await axios.get("/api/places/place_details", {
      params: { place_id },
    });

    return response.data.result || {};
  } catch (error) {
    console.error("❌ 장소 상세 정보 API 호출 오류:", error);
    return {};
  }
};

/**
 * 🔹 4. 장소 사진 조회
 */
export const fetchPlacePhoto = async (place_id, maxWidth = 400) => {
  if (!place_id) return ""; // ✅ `photoReference` 대신 `placeId` 사용

  try {
    const response = await axios.get("/api/places/place_photo", {
      params: { place_id, maxWidth },
      responseType: "arraybuffer",
    });
    const mimeType = "image/jpeg";
    const blob = new Blob([response.data], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("❌ 장소 사진 요청 실패:", error);
    return "";
  }
};

/**
 * 🔹 5. 주소를 위도, 경도로 변환 (Geocoding)
 */
export const fetchGeocode = async (address) => {
  if (!address.trim()) return { lat: 0, lng: 0 }; // 🔹 빈 주소 방지

  try {
    const response = await axios.get("/api/places/geocode", {
      params: { address },
    });

    return response.data.results[0]?.geometry?.location || { lat: 0, lng: 0 };
  } catch (error) {
    console.error("❌ 주소 변환 API 호출 오류:", error);
    return { lat: 0, lng: 0 };
  }
};

/**
 * 🔹 6. 위도, 경도를 주소로 변환 (Reverse Geocoding)
 */
export const fetchReverseGeocode = async (latlng) => {
  if (!latlng.trim()) return ""; // 🔹 빈 입력 방지

  try {
    const response = await axios.get("/api/places/reverse_geocode", {
      params: { latlng },
    });

    return response.data.results[0]?.formatted_address || "";
  } catch (error) {
    console.error("❌ 좌표 변환 API 호출 오류:", error);
    return "";
  }
};

/**
 * 🔹 7. 추천된 여행 경로 조회 (Google Directions API 활용)
 * @param {string} origin - 출발지 (예: "서울")
 * @param {string} destination - 도착지 (예: "부산")
 * @param {string} waypoints - 경유지 (선택 사항, 예: "대전|대구")
 * @returns {Promise<Object>} - 이동 거리, 예상 소요 시간, 이동 수단 정보 반환
 */
export const fetchRecommendRoute = async (
  origin,
  destination,
  waypoints = ""
) => {
  if (!origin || !destination) {
    console.error("❌ 출발지와 도착지를 입력해야 합니다.");
    return null;
  }

  try {
    const response = await axios.get("/api/places/recommend_route", {
      params: { origin, destination, waypoints },
    });

    console.log("✅ 추천 경로 응답:", response.data);
    return response.data || null;
  } catch (error) {
    console.error("❌ 추천 경로 API 호출 오류:", error);
    return null;
  }
};