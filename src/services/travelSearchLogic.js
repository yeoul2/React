import axios from "axios";

// 🔹 로그인한 사용자의 최근 검색어 목록 가져오기
export const getRecentSearches = async (accessToken) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent-list`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 최근 검색어 불러오기 실패: ", error);
  }
};

// 🔹 검색어 저장 (로그인한 사용자만 가능)
export const saveSearch = async (searchTerm, searchType, accessToken) => {
  try {
    await axios.post(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent-save`,
      null,
      {
        params: { searchTerm, searchType },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // ✅ 저장 후 최신 검색어 목록 반환
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent-list`,
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
export const deleteRecentSearch = async (
  searchTerm,
  searchType,
  accessToken
) => {
  try {
    await axios.delete(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent-delete`,
      {
        params: { searchTerm, searchType },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // ✅ 삭제 후 최신 검색어 목록 반환
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent-list`,
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
      `${process.env.REACT_APP_SPRING_IP}api/search/popular-list`
    );
    return response.data;
  } catch (error) {
    console.error("❌ 인기 여행지 불러오기 실패: ", error);
  }
};
