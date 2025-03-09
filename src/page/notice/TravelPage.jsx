import React, { useEffect, useState } from "react";

const places = [
  { id: 1, name: "해보러감", location: "제주도", description: "아름다운 해돋이 명소", image: "https://example.com/image1.jpg", rating: 4.5, reviews: 128, date: "2024-02-20" },
  { id: 2, name: "남산서울타워", location: "서울", description: "서울의 랜드마크", image: "https://example.com/image2.jpg", rating: 4.0, reviews: 256, date: "2024-02-18" },
  { id: 3, name: "불국사", location: "경주", description: "서울의 랜드마크", image: "https://example.com/image3.jpg", rating: 5.0, reviews: 198, date: "2024-02-15" },
  { id: 4, name: "해운대", location: "부산", description: "서울의 랜드마크", image: "https://example.com/image4.jpg", rating: 4.2, reviews: 311, date: "2024-02-10" },
  { id: 5, name: "경복궁", location: "서울", description: "서울의 랜드마크", image: "https://example.com/image5.jpg", rating: 4.7, reviews: 421, date: "2024-02-05" },
  { id: 6, name: "한라산", location: "제주도", description: "서울의 랜드마크", image: "https://example.com/image6.jpg", rating: 4.6, reviews: 211, date: "2024-02-01" },
  { id: 7, name: "광안리", location: "부산", description: "서울의 랜드마크", image: "https://example.com/image7.jpg", rating: 4.3, reviews: 189, date: "2024-01-25" },
  { id: 8, name: "설악산", location: "강원도", description: "서울의 랜드마크", image: "https://example.com/image8.jpg", rating: 4.8, reviews: 237, date: "2024-01-20" },
  { id: 9, name: "전주 한옥마을", location: "전주", description: "서울의 랜드마크", image: "https://example.com/image9.jpg", rating: 4.4, reviews: 320, date: "2024-01-15" },
  { id: 10, name: "대구 83타워", location: "대구", description: "서울의 랜드마크", image: "https://example.com/image10.jpg", rating: 4.1, reviews: 142, date: "2024-01-10" }
];

const TravelPage = () => {
  const [searchFilter, setSearchFilter] = useState("제목만"); // 기본 필터 : 제목만
  const [searchQuery, setSearchQuery] = useState(""); // 입력 칸 값
  const [searchTerm, setSearchTerm] = useState(""); // 실제 검색 실행 후 값
  const [sortOrder, setSortOrder] = useState("최신순");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 페이지당 3개씩 표시
  const pageGroupSize = 10; // 10페이지씩 그룹화

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

  // ✅ 로그인 체크 및 경고창
  const handleLoginRedirect = () => {
    alert("로그인 후 이용하세요.");
    window.location.href = "/login";
  };

  // ✅ 검색 실행 함수
  const handleSearch = () => {
    setSearchTerm(searchQuery); // 검색어 저장
  };

  // ✅ 검색 필터 적용
  const filteredPlaces = places.filter((place) => {
    if (!searchTerm) return true;

    switch (searchFilter) {
      case "제목만":
        return place.name.includes(searchTerm);
      case "내용만":
        return place.description.includes(searchTerm);
      case "나라":
        return place.location.includes(searchTerm);
      case "제목+내용":
        return place.name.includes(searchTerm) || place.description.includes(searchTerm);
      default:
        return true;
    }
  });

  // ✅ 정렬 기능 (최신순, 귤(만족도), 여율(인기순))
  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortOrder === "여율(인기순)") return b.reviews - a.reviews;
    if (sortOrder === "귤(만족도)") return b.rating - a.rating;
    return new Date(b.date) - new Date(a.date);
  });

  // ✅ 현재 페이지에 해당하는 데이터만 표시
  const paginatedPlaces = sortedPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedPlaces.length / itemsPerPage); // 전체 페이지 계산

  const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

      {/* 검색 & 정렬 & 글쓰기 버튼 */}
      <div className="py-8 flex flex-wrap items-center justify-between">

        {/* 검색 필터 (왼쪽 배치) */}
        <div className="flex items-center space-x-2 border p-2 rounded-md shadow-sm w-full md:w-auto">
          <select className="border px-4 py-2 rounded-md" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}>
            <option value="제목만">제목만</option>
            <option value="내용만">내용만</option>
            <option value="나라">나라</option>
            <option value="제목+내용">제목+내용</option>
          </select>

          <input
            type="text"
            placeholder="검색어를 입력해 주세요."
            className="border px-4 py-2 flex-1 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(); //  엔터 키 입력 시 검색 실행
            }}

          />

          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
            onClick={handleSearch}>🔍</button>

        </div>

        {/* 정렬 & 글쓰기 (오른쪽 배치) */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <select className="border px-4 py-2 rounded-md" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="최신순">최신순</option>
            <option value="귤(만족도)">🍊 귤(만족도)</option>
            <option value="여율(인기순)" style={{ backgroundImage: "url('/your-image-url.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat", paddingLeft: "30px" }}>여율(인기순)</option>
          </select>

          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            onClick={() => window.location.href = "/write"}
          /* onClick={() => isLoggedIn ? window.location.href = "/write" : handleLoginRedirect()} */
          >
            글쓰기
          </button>
        </div>
      </div>

      {/* 여행지 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {paginatedPlaces.map((place) => (
          <div key={place.id} className="border p-4 rounded-md shadow-md">
            <img src={place.image} className="w-full h-48 object-cover" alt={place.name} />
            <h3 className="text-lg font-semibold mt-2">{place.name}</h3>
            <p className="text-sm text-gray-600">여행지: {place.location}</p>
            <p className="text-sm text-gray-500">리뷰 날짜: {place.date}</p>

            {/* 🍊 귤(만족도) 표시 */}
            <div className="flex items-center mt-2">
              <span className="text-lg">🍊</span>
              <span className="text-gray-700 ml-2"> {place.rating} 만족도</span>
            </div>

            <button className="w-full bg-orange-500 text-white py-2 mt-2 rounded-md hover:bg-orange-600"
              onClick={() => isLoggedIn ? window.location.href = `/detail/${place.id}` : handleLoginRedirect()}>
              상세보기
            </button>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-8 flex justify-center">
        <nav className="relative z-0 inline-flex shadow-sm border border-gray-300" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-gray-500 bg-white-100 text-sm font-medium border-r border-gray-300 hover:bg-orange-500 hover:text-white cursor-pointer"
          >
            맨앞
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - pageGroupSize, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-gray-500 bg-white-100 text-sm font-medium border-r border-gray-300 hover:bg-orange-500 hover:text-white cursor-pointer"
          >
            ‹ 이전
          </button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(startPage + i)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border-r border-gray-300 cursor-pointer ${currentPage === startPage + i ? "text-white bg-orange-500" : "text-gray-700 bg-white-100 hover:bg-orange-500 hover:text-white"}`}>
              {startPage + i}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + pageGroupSize, totalPages))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 text-gray-500 bg-white-100 text-sm font-medium border-r border-gray-300 hover:bg-orange-500 hover:text-white cursor-pointer"
          >
            다음 ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 text-gray-500 bg-white-100 text-sm font-medium hover:bg-orange-500 hover:text-white cursor-pointer"
          >
            맨뒤
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TravelPage;
