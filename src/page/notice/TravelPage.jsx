import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "react-hook-form";
import { getBoardCount, getBoardList } from "../../services/boardLogic";

const TravelPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]); // DB에서 가져올 게시판 데이터
  const [searchFilter, setSearchFilter] = useState("제목만"); // 기본 필터 : 제목만
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 입력
  const [searchTerm, setSearchTerm] = useState(""); // 실제 검색 실행 후 값
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 기준
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 정렬 드롭다운 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPosts, setTotalPosts] = useState(0); // 총 게시물 수 상태
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수 상태
  const [pageNumbers, setPageNumbers] = useState([]); // 페이지 번호 상태
  const itemsPerPage = 8; // 페이지당 게시글 개수
  const pageGroupSize = 10; // 페이지 그룹 크기
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const dropdownRef = useRef(null); // 드롭다운 외부 클릭 감지를 위한 ref

  // ✅ 로그인 상태 확인 DB연결
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken"); // ✅ JWT 토큰 가져오기
    setIsLoggedIn(!!accessToken); // 토큰이 있으면 true, 없으면 false
  }, []);

  // ✅ 로그인/로그아웃 감지
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsLoggedIn(!!accessToken);
    };

    checkLoginStatus(); // 최초 실행

    // ✅ 로그인/로그아웃 감지
    window.addEventListener("storage", checkLoginStatus);

    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // ✅ 로그인 체크 후 페이지 이동
  const navigateWithAuth = (url) => {
    if (isLoggedIn) {
      navigate(url); // ✅ 로그인 상태면 해당 페이지로 이동
    } else {
      alert("로그인 후 이용하세요."); // 알럿 창 표시
      window.location.href = "/login?redirect=" + encodeURIComponent(url); // 로그인 후 원래 가려던 페이지로 이동하게 개선
    }
  };

  // 이전 버튼 클릭 시
  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage - 1;
      return newPage < 1 ? 1 : newPage; // 최소값을 1로 설정
    });
  };

  // 다음 버튼 클릭 시
  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      return newPage > totalPages ? totalPages : newPage; // 최대값을 totalPages로 설정
    });
  };


  // ✅ 게시판 데이터 DB에서 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderValue = sortOrder === "latest" ? "최신순" :
          sortOrder === "rating" ? "만족도순" :
            "인기순";

        // getBoardCount로 총 게시물 수 가져오기
        const boardCount = await getBoardCount(searchFilter, searchTerm);
        setTotalPosts(boardCount); // 총 게시물 수 상태 업데이트

        // 총 페이지 수 계산
        const calculatedTotalPages = Math.ceil(boardCount / itemsPerPage);
        setTotalPages(calculatedTotalPages);

        // getBoardList 호출하여 게시판 데이터 가져오기
        const placesData = await getBoardList(orderValue, searchFilter, searchTerm, currentPage);
        setPlaces(placesData);

      } catch (error) {
        console.error("게시판 데이터 불러오기 실패:", error);
      }
    }
    fetchData()
  }, [sortOrder, searchFilter, searchTerm, currentPage]); // 의존성 배열

  useEffect(() => {
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    // 페이지 번호 배열 생성
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    setPageNumbers(pageNumbers); // 페이지 번호 상태 업데이트
  }, [currentPage, totalPages]); // currentPage와 totalPages가 변경될 때마다 페이지 번호 재계산



  // ✅ 드롭다운 외부 클릭 감지 코드
  useEffect(() => {
    // ✅ 드롭다운 영역 외부 클릭 시 드롭다운을 닫는 함수
    const handleClickOutside = (event) => {
      // ✅ dropdownRef가 존재하고, 클릭된 요소가 드롭다운 내부에 포함되지 않는 경우
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // 🔽 드롭다운을 닫는다.
      }
    };

    // ✅ 마우스 클릭 이벤트를 감지하여 handleClickOutside 함수 실행
    document.addEventListener("mousedown", handleClickOutside);

    // ✅ useEffect의 클린업 함수 (컴포넌트가 언마운트될 때 실행)
    return () => document.removeEventListener("mousedown", handleClickOutside); // ✅ 이벤트 리스너 제거하여 메모리 누수를 방지
  }, []); // ✅ 의존성 배열이 빈 배열이므로 컴포넌트가 처음 마운트될 때 한 번만 실행됨

  // ✅ 정렬 옵션 목록 (이미지 포함)
  const sortOptions = [ // 인기순을 기본으로해서 순서 바꿈
    { value: "popularity", label: " (인기순)", image: "/images/Yeoul_Logo.png" },
    { value: "latest", label: "최신순" },
    { value: "rating", label: "🍊 (만족도)" }
  ];

  // ✅ 현재 선택된 정렬 옵션
  const selectedOption = sortOptions.find((option) => option.value === sortOrder) || sortOptions[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

      {/* 검색 & 정렬 & 글쓰기 버튼 */}
      <div className="flex flex-wrap items-center justify-between py-6">

        {/* 검색 필터 (왼쪽 배치) */}
        <div className="flex items-center space-x-2 border p-2 rounded-md shadow-sm w-full md:w-auto">
          <select
            className="border-1.5px px-4 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          >
            <option value="제목만">제목만</option>
            <option value="내용만">내용만</option>
            <option value="나라">나라</option>
            <option value="제목+내용">제목+내용</option>
          </select>

          <input
            type="text"
            placeholder="검색어를 입력하세요."
            className="border-1.5px px-4 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchTerm(searchQuery)} //  엔터 키 입력 시 검색 실행
          />

          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            onClick={(e) => setSearchTerm(searchQuery)}>🔍</button>
        </div>

        {/*✅ 정렬 (드롭다운) & 글쓰기 (오른쪽 배치) */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">

          {/* 드롭다운 (Ref 추가) */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-auto flex items-center justify-between border px-4 py-2 rounded-md bg-white shadow-md"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedOption.image &&
                <img src={selectedOption.image} alt="icon" className="w-5 h-5 mr-2" />
              }
              {selectedOption.label}
              <span className="ml-auto">▼</span>
            </button>

            {/* 드롭다운 메뉴 (자동 너비 조정) */}
            {isDropdownOpen && (
              <ul className="absolute left-0 w-auto min-w-max mt-1 bg-white border rounded-md shadow-md z-10 whitespace-nowrap">
                <ul className="absolute left-0 w-full bg-white border-1.5 border-orange-500 rounded-md shadow-md z-10"></ul>
                {sortOptions.map((option) => (
                  <li
                    key={option.value}
                    className="flex items-center px-4 py-2 hover:bg-orange-400 hover:text-white cursor-pointer"
                    onClick={() => {
                      setSortOrder(option.value);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {/* ✅ 아이콘과 텍스트를 묶어서 정렬 */}
                    <div className="flex items-center w-full">
                      {option.image && <img src={option.image} alt="icon" className="w-5 h-5 mr-2" />}
                      <span>{option.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ 글쓰기 버튼 - 로그인 체크 */}

          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            onClick={() => navigateWithAuth("/write")}
          >
            글쓰기
          </button>
        </div>
      </div>

      {/* ✅ 여행지 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
        style={{ gridTemplateRows: "repeat(2, auto)" }} // ✅ 세로(row) 2줄로 제한
      >
        {(places?.slice(0, 8) || []).map((place) => ( // ✅ 최대 8개만 표시 (4x2)
          <div key={place.tb_no} className="border p-4 rounded-md shadow-md">
            <img src={place.tb_photo1} className="w-full h-48 object-cover" alt={place.tb_title} />
            <h3 className="text-lg font-semibold mt-2">{place.tb_title}</h3>
            <p className="text-sm text-gray-600">여행지: {place.tb_country}</p>
            <p className="text-sm text-gray-500">리뷰 날짜: {place.tb_up_date}</p>

            {/* 🍊 귤(만족도) 표시 */}
            <div className="flex items-center mt-2">
              <span className="text-lg " ></span>
              <img src="./images/Capybara_tangerine.png" alt="" className="w-7 h-10" />
              <span className="text-orange-500 ml-2 fa-solid"> {place.tb_star}</span>
            </div>

            {/* 좋아요 표시 */}
            <div className="flex items-center mt-2">
              <span className="text-lg"></span>
              <img src="./images/Capybara_heart.png" alt="" className="w-9 h-10" />
              <span className="text-orange-500 ml-2 fa-solid"> {place.tb_like_count}</span>
            </div>
            <button
              className="w-full bg-orange-500 text-white py-2 mt-2 rounded-md hover:bg-orange-600"
              onClick={() => navigateWithAuth(`/detail/${place.tb_no}`)} // ✅ 클릭한 게시글 tb_no 반영
            >
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
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-gray-500 bg-white-100 text-sm font-medium border-r border-gray-300 hover:bg-orange-500 hover:text-white cursor-pointer"
          >
            ‹ 이전
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border-r border-gray-300 cursor-pointer ${currentPage === page ? "text-white bg-orange-500" : "text-gray-700 bg-white-100 hover:bg-orange-500 hover:text-white"}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
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
