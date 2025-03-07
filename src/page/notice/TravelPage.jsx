import React, { useEffect, useState } from "react";

const places = [
  { id: 1, name: "성산일출봉", location: "제주도", image: "https://example.com/image1.jpg", rating: 4.5, reviews: 128, date: "2024-02-20" },
  { id: 2, name: "남산서울타워", location: "서울", image: "https://example.com/image2.jpg", rating: 4.0, reviews: 256, date: "2024-02-18" },
  { id: 3, name: "불국사", location: "경주", image: "https://example.com/image3.jpg", rating: 5.0, reviews: 198, date: "2024-02-15" },
  { id: 4, name: "해운대", location: "부산", image: "https://example.com/image4.jpg", rating: 4.2, reviews: 311, date: "2024-02-10" },
  { id: 5, name: "경복궁", location: "서울", image: "https://example.com/image5.jpg", rating: 4.7, reviews: 421, date: "2024-02-05" },
  { id: 6, name: "한라산", location: "제주도", image: "https://example.com/image6.jpg", rating: 4.6, reviews: 211, date: "2024-02-01" },
  { id: 7, name: "광안리", location: "부산", image: "https://example.com/image7.jpg", rating: 4.3, reviews: 189, date: "2024-01-25" },
  { id: 8, name: "설악산", location: "강원도", image: "https://example.com/image8.jpg", rating: 4.8, reviews: 237, date: "2024-01-20" },
  { id: 9, name: "전주 한옥마을", location: "전주", image: "https://example.com/image9.jpg", rating: 4.4, reviews: 320, date: "2024-01-15" },
  { id: 10, name: "대구 83타워", location: "대구", image: "https://example.com/image10.jpg", rating: 4.1, reviews: 142, date: "2024-01-10" }
];

const TravelPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("최신순");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 페이지당 3개씩 표시

  // ✅ 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [userId, setUserId] = useState(""); // 로그인한 유저의 ID
  
  useEffect(() => {
    try {
      const user = localStorage.getItem("userId");
      if (user) {
        setIsLoggedIn(true);
        setUserId(user);
      }
    } catch (error) {
      console.error("로컬 스토리지에서 데이터를 가져오는 중 오류 발생:", error);
    }
  }, []);

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  // ✅ 필터링된 여행지 목록
  const filteredPlaces = places
    .filter((place) => selectedRegion === "전체 지역" || place.location.includes(selectedRegion))
    .filter((place) => place.name.includes(searchQuery));

  // ✅ 정렬된 데이터 반환
  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortOrder === "인기순") return b.reviews - a.reviews;
    if (sortOrder === "별점순") return b.rating - a.rating;
    return new Date(b.date) - new Date(a.date); // 최신순 (날짜 내림차순)
  });

  // ✅ 현재 페이지에 해당하는 데이터만 표시
  const paginatedPlaces = sortedPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedPlaces.length / itemsPerPage); // 전체 페이지 계산

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      {/* 여행 필터 */}
      <div className="py-8">
        <div className="flex flex-wrap items-center justify-between mb-8">
          {/* 지역 선택 드롭다운 */}
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <select
              className="w-full md:w-48 border-gray-300 rounded-md text-sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="전체 지역">전체 지역</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="제주">제주</option>
            </select>
          </div>

          {/* 검색창 & 정렬 방식 선택 + 글쓰기 버튼 */}
          <div className="w-full md:w-auto flex items-center space-x-4">
            {/* 검색 입력창 */}
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="여행지 검색"
                className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* 정렬 방식 선택 */}
            <select
              className="w-32 border-gray-300 rounded-md text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="최신순">최신순</option>
              <option value="인기순">인기순</option>
              <option value="별점순">별점순</option>
            </select>

            {/* 글쓰기 버튼 추가 */}
            <button
              onClick={() => window.location.href = "/write"} // 글쓰기 페이지로 이동
              className="bg-custom text-white px-4 py-2 text-sm rounded-md"
            >
              글쓰기
            </button>

          </div>
        </div>
      </div>

      {/* 여행지 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPlaces.map((place) => (
          <div key={place.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img src={place.image} className="w-full h-48 object-cover" alt={place.name} />
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.location}</p>
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={i < Math.floor(place.rating) ? "fas fa-star" : "far fa-star"}></i>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{place.rating} ({place.reviews}개 리뷰)</span>
              </div>
              {/* 리뷰 날짜 표시 */}
              <p className="text-sm text-gray-500">리뷰 날짜: {place.date}</p>
              <button className="w-full rounded-md bg-custom text-white py-2 text-sm font-medium">
                상세보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 mx-1 border rounded-md text-sm bg-gray-100"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-2 mx-1 border rounded-md text-sm ${currentPage === i + 1 ? "bg-blue-500 text-white" : "text-gray-700 bg-white"}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 mx-1 border rounded-md text-sm bg-gray-100">
          다음
        </button>
      </div>

      {/* 로그인 프롬프트 */}
      {!isLoggedIn ? (
        <div className="bg-custom bg-opacity-5 rounded-lg p-8 mt-4 mb-8 text-center">
          <h2 className="text-2xl font-bold text-custom mb-4">더 많은 여행 정보를 확인하세요!</h2>
          <p className="text-gray-600 mb-6">로그인하시면 상세 리뷰와 추천 여행지를 확인할 수 있습니다.</p>
          <button className="rounded-md bg-custom text-white px-8 py-3 text-sm font-medium" onClick={handleLoginClick}>
            지금 로그인하기
          </button>
        </div>
      ) : (
        <div className="bg-custom bg-opacity-5 rounded-lg p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-custom mb-4">환영합니다, {userId}님!</h2>
          <p className="text-gray-600 mb-6">다른 사용자들의 여행기를 확인해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default TravelPage;
