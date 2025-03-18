import axios from "axios";

/**
 * 🔹 1. 자동완성 검색 (Place Autocomplete)
 * @param {string} query - 사용자 입력
 * @param {string} type - 검색 유형 ('regions' | 'cities' | 'geocode')
 * @returns {Promise<Array<string>>} - 자동완성된 장소 목록
 */
export const fetchAutocomplete = async (query, type) => {
  if (!query) return [];

  try {
    const response = await axios.get("/api/places/autocomplete", {
      params: { input: query, type },
    });

    console.log("✅ API 응답 데이터:", response.data); // 응답 데이터 확인용 로그 추가

    return response.data.predictions
      ? response.data.predictions.map((place) => place.description)
      : [];
  } catch (error) {
    console.error("❌ 자동완성 API 호출 오류:", error);
    return [];
  }
};

/**
 * 🔹 2. 특정 위치 주변 검색 (Nearby Search)
 * @param {string} location - 위도, 경도 (예: "37.5665,126.9780")
 * @param {string} type - 장소 유형 (예: "tourist_attraction", "restaurant")
 * @param {number} radius - 검색 반경 (미터 단위)
 * @returns {Promise<Array<object>>} - 검색된 장소 목록
 */
export const fetchNearbyPlaces = async (location, type, radius = 5000) => {
  try {
    const response = await axios.get("/api/places/nearby_search", {
      params: { location, radius, type },
    });

    return response.data.results;
  } catch (error) {
    console.error("❌ 장소 검색 API 호출 오류:", error);
    return [];
  }
};

/**
 * 🔹 3. 장소 상세 정보 조회 (Place Details)
 * @param {string} placeId - Google Places API의 `place_id`
 * @returns {Promise<object>} - 장소의 상세 정보
 */
export const fetchPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get("/api/places/place_details", {
      params: { placeId },
    });

    return response.data.result;
  } catch (error) {
    console.error("❌ 장소 상세 정보 API 호출 오류:", error);
    return {};
  }
};

/**
 * 🔹 4. 장소 사진 조회
 * @param {string} photoReference - 사진의 참조값
 * @returns {Promise<string>} - 장소 사진 URL
 */
export const fetchPlacePhoto = async (photoReference, maxWidth = 400) => {
  try {
    const response = await axios.get("/api/places/place_photo", {
      params: { photoReference, maxWidth },
      responseType: "arraybuffer", // ✅ byte[] 형태로 수신
    });

    const mimeType = "image/jpeg"; // Google API는 기본적으로 JPEG 이미지를 반환함
    const blob = new Blob([response.data], { type: mimeType });
    return URL.createObjectURL(blob); // ✅ 브라우저에서 사용할 수 있는 URL 생성
  } catch (error) {
    console.error("❌ 장소 사진 요청 실패:", error);
    return "";
  }
};

/**
 * 🔹 5. 주소를 위도, 경도로 변환 (Geocoding)
 * @param {string} address - 변환할 주소
 * @returns {Promise<{ lat: number, lng: number }>} - 변환된 위도, 경도
 */
export const fetchGeocode = async (address) => {
  try {
    const response = await axios.get("/api/places/geocode", {
      params: { address },
    });

    return response.data.results[0].geometry.location;
  } catch (error) {
    console.error("❌ 주소 변환 API 호출 오류:", error);
    return { lat: 0, lng: 0 };
  }
};

/**
 * 🔹 6. 위도, 경도를 주소로 변환 (Reverse Geocoding)
 * @param {string} latlng - 변환할 위도, 경도 (예: "37.5665,126.9780")
 * @returns {Promise<string>} - 변환된 주소
 */
export const fetchReverseGeocode = async (latlng) => {
  try {
    const response = await axios.get("/api/places/reverse_geocode", {
      params: { latlng },
    });

    return response.data.results[0].formatted_address;
  } catch (error) {
    console.error("❌ 좌표 변환 API 호출 오류:", error);
    return "";
  }
};
