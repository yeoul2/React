import axios from "axios";

/**
 * 🔍 최근 검색어 가져오기
 * @param {string} userId - 사용자 ID
 * @param {string} accessToken - 인증 토큰
 */
export const getRecentSearches = async (user_id, accessToken) => {
  try {
    if (!user_id || !accessToken) {
      console.error("❌ userId 또는 accessToken이 없습니다.");
      return [];
    }

    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/recent/`, // ✅ 백엔드 URI 일치
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return Array.isArray(response.data) ? response.data : []; // ✅ 렌더링 안정성 확보
  } catch (error) {
    console.error("❌ 최근 검색어 불러오기 실패:", error);
    return [];
  }
};

/**
 * 💾 검색어 저장
 * @param {string} searchTerm - 검색어
 * @param {string} searchType - 검색 타입 (예: country/city 등)
 * @param {string} accessToken - 인증 토큰
 */
export const saveSearch = async (searchTerm, searchType, accessToken) => {
  try {
    if (!searchTerm || !searchType || !accessToken) {
      console.error("❌ 저장할 정보가 누락되었습니다.");
      return;
    }

    // ✅ JWT에서 user_id 추출
    const parseJwt = (token) => {
      try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        return payload;
      } catch (e) {
        console.error("❌ JWT 파싱 오류:", e);
        return null;
      }
    };

    const userId = parseJwt(accessToken)?.sub;
    if (!userId) {
      console.error("❌ user_id 추출 실패");
      return;
    }

    await axios.post(
      `${process.env.REACT_APP_SPRING_IP}api/search/save`,
      {
        searchTerm,
        searchType,
        user_id: userId, // ✅ 반드시 포함
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    console.error("❌ 검색어 저장 실패:", error);
  }
};

/**
 * 🗑 검색어 삭제
 * @param {string} searchTerm - 삭제할 검색어
 * @param {string} accessToken - 인증 토큰
 */
export const deleteRecentSearch = async (searchTerm, accessToken) => {
  try {
    if (!searchTerm || !accessToken) {
      console.error("❌ 삭제할 정보가 누락되었습니다.");
      return;
    }

    await axios.delete(`${process.env.REACT_APP_SPRING_IP}api/search/delete`, {
      data: { searchTerm }, // ✅ DELETE 요청은 반드시 data로 전달
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error("❌ 검색어 삭제 실패:", error);
  }
};

/**
 * 📊 인기 검색어 조회
 */
export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SPRING_IP}api/search/popular` // ✅ 백엔드 URI 일치
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ 인기 검색어 조회 실패:", error);
    return [];
  }
};
