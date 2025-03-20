import axios from "axios";

// 🔹 로그인한 사용자의 최근 검색어 목록 가져오기
export const getRecentSearches = async (accessToken) => {
  try {
    if (!accessToken) {
      console.error("❌ accessToken이 없습니다. 로그인 여부를 확인하세요.");
      return []; // ✅ 빈 배열 반환
    }
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent_list`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API 응답 - recentSearches:", response.data); // 🔹 디버깅 로그 추가

    return Array.isArray(response.data) ? response.data : []; // ✅ 응답이 배열이 아닐 경우 대비
  } catch (error) {
    console.error("❌ 최근 검색어 불러오기 실패: ", error);
    return []; // ✅ 오류 발생 시 안전한 기본값 반환
  }
};

// 🔹 검색어 저장 (로그인한 사용자만 가능)
export const saveSearch = async (searchTerm, searchType, accessToken) => {
  try {
    await axios.post(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent_save`,
      null,
      {
        params: { searchTerm, searchType },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // ✅ 저장 후 최신 검색어 목록 반환
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent_list`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 검색어 저장 실패: ", error);
  }
};

// 🔹 최근 검색어 삭제
export const deleteRecentSearch = async (searchTerm, accessToken) => {
  try {
    await axios.delete(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent_delete`,
      {
        params: { searchTerm },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // ✅ 삭제 후 최신 검색어 목록 반환
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent_list`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 검색어 삭제 실패: ", error);
  }
};

// 🔹 인기 여행지 목록 가져오기
export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/popular_list`
    );
    return response.data;
  } catch (error) {
    console.error("❌ 인기 여행지 불러오기 실패: ", error);
  }
};
