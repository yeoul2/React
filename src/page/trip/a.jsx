import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import mainImg from "../../assets/여행지 이미지/한국/한국여행지.jpg";
import korea from "../../assets/여행지 이미지/한국/불꽃놀이.jpg";
import japan from "../../assets/여행지 이미지/일본/훗카이도 시코쓰 호수 얼음 축제.jpg";
import italian from "../../assets/여행지 이미지/이탈리아/베로나 오페라 페스티벌.JPG";
import thailand from "../../assets/여행지 이미지/태국/코팡안 풀문 파티.JPG";
import maldives from "../../assets/여행지 이미지/몰디브/몰디브 전통 보트.JPG";
import usa from "../../assets/여행지 이미지/미국/뉴욕 타임스퀘어 새해맞이.JPG";
import TravelSearch from "../../components/TravelSearch";

// 나라 리스트 데이터
const continents = [
  { name: "대한민국", image: korea, description: "한국의 멋진 여행지를 만나보세요." },
  { name: "일본", image: japan, description: "일본의 전통과 현대가 공존하는 여행지." },
  { name: "이탈리아", image: italian, description: "이탈리아의 아름다운 건축과 문화를 경험하세요." },
  { name: "태국", image: thailand, description: "태국의 이국적인 휴양지를 즐겨보세요." },
  { name: "몰디브", image: maldives, description: "몰디브의 환상적인 해변을 만나보세요." },
  { name: "미국", image: usa, description: "미국의 다양한 여행 명소를 탐방하세요." },
];

const HomePage = () => {
  const navigate = useNavigate(); // ✅ useNavigate 사용
  const [mainSearchText, setMainSearchText] = useState(""); // ✅ 메인 배너 검색 상태
  const [country, setCountry] = useState(""); // 여행 국가
  const [tripDuration, setTripDuration] = useState(""); // 여행 기간
  const [isSaving, setIsSaving] = useState(false); // DB 저장 로딩 상태
  const [dateRange, setDateRange] = useState([]);
  const [adults, setAdults] = useState(2);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState(false);
  const [continentSearchText, setContinentSearchText] = useState(""); // ✅ 나라 검색 상태
  const [filteredContinents, setFilteredContinents] = useState(continents);
  const [selectedCountry, setSelectedCountry] = useState(null); // 🔹 모달 상태 관리

  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null);

  // 📌 Flatpickr 초기화 및 관리
  useEffect(() => {
    if (datePickerRef.current) {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 기존 인스턴스 제거

      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        locale: "ko",
        mode: "range",
        dateFormat: "Y.m.d",
        minDate: "today",
        disableMobile: true,
        onChange: (selectedDates) => {
          setDateRange(selectedDates);
          setIsDatePickerOpen(false); // 📌 날짜 선택 시 달력 닫기
        },
        onClose: () => setIsDatePickerOpen(false), // 📌 빈 곳 클릭 시 달력 닫기
      });
    }
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy(); // 언마운트 시 인스턴스 제거
      }
    };
  }, []);

  /** ✅ 메인 배너 검색 (여행 코스 검색) */
  const handleSearch = () => {
    if (mainSearchText.trim()) {
      navigate(`/course?search=${encodeURIComponent(mainSearchText)}`);
    }

    /* try {
      // 🔹 AI API 요청 (axios 사용)
      const response = await axios.post("https://your-ai-api.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mainSearchText }),
      });

      const result = await response.json();

      // 🔹 검색 결과가 존재하는 경우, MainContent로 이동
      window.location.href = `/course?search=${encodeURIComponent(mainSearchText)}`;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 문제가 발생했습니다.");
    } */
  };

  /** ✅ 나라 목록 검색 */
  const handleContinentSearch = () => {
    const filtered = continents.filter((continent) =>
      continent.name.includes(continentSearchText)
    );
    setFilteredContinents(filtered);
  };

  /** ✅ 나라 클릭 시 모달 표시 */
  const handleClick = (continent) => {
    console.log("선택된 나라:", continent); // 🔹 디버깅용 콘솔 로그 추가
    setSelectedCountry(continent); // 🔹 나라 클릭 시 모달 열기
  };

  const handleCloseModal = () => {
    setSelectedCountry(null);
    setContinentSearchText(""); // 🔹 검색어 초기화
    setFilteredContinents(continents); // 🔹 나라 목록 초기화
  };


  /** ✅ 엔터 키 입력 시 검색 실행 */
  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      if (type === "main") {
        handleSearch();
      } else if (type === "continent") {
        handleContinentSearch();
      }
    }
  };

  // 📌 달력 토글 기능
  const toggleDatePicker = () => {
    if (flatpickrInstance.current) {
      if (isDatePickerOpen) {
        flatpickrInstance.current.close(); // 📌 달력이 열려 있으면 닫기
      } else {
        flatpickrInstance.current.open(); // 📌 달력이 닫혀 있으면 열기
      }
      setIsDatePickerOpen(!isDatePickerOpen); // 📌 상태 업데이트
    }

    // ✅ 인원수 드롭다운 닫기 (달력과 인원수가 동시에 열리지 않도록)
    setIsPeopleOpen(false);
  };

  // 📌 인원 선택 토글 기능
  const togglePeopleDropdown = () => {
    setIsPeopleOpen(!isPeopleOpen); // ✅ 인원수 상태만 변경

    // ✅ 달력 닫기 (달력과 인원수가 동시에 열리지 않도록)
    setIsDatePickerOpen(false);
  };

  return (
    <>
    </>
    // <main className="relative">
    //   {/* 메인 배너 */}
    //   <h1 className="text-5xl font-bold mb-6 font-cute tracking-wide whitespace-nowrap text-center">
    //     <span className="bg-sky-200 text-gray-900 px-6 py-3 rounded-md inline-block">
    //       여울아~ 여행 코스 짜봐 이쁘게
    //     </span>
    //   </h1>

    //   {/* ✅ 메인 배너 검색 */}
    //   <section className="relative bg-gray-900 h-[600px] overflow-hidden flex flex-col justify-center items-center text-white">
    //     {/* 배경 이미지 */}
    //     <img
    //       src={mainImg}
    //       className="absolute inset-0 w-full h-full object-cover opacity-50"
    //       alt="배경"
    //     />

    //     {/* 메인 컨텐츠 */}
    //     <h1 className="text-4xl font-bold z-10 mb-6">여울아~ 여행 코스 쒼나게 말아보자!!</h1>

    //     {/* 검색 박스 (4개 요소 가로 정렬, 검색 버튼만 작게) */}
    //     <div className="relative grid grid-cols-4 gap-4 margin: auto max-w-6xl bg-transparent bg-opacity-0">

    //       {/* 여행 국가 입력 */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">여행 국가</label>
    //         <TravelSearch setCountry={setCountry} /> {/* TravelSearch 컴포넌트 추가 */}
    //       </div>

    //       {/* 여행 기간 선택 */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">여행 기간</label>
    //         <div className="relative">
    //           <i className="far fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer mb-3" onClick={toggleDatePicker}></i>
    //           <input
    //             ref={datePickerRef}
    //             className="text-white px-4 py-2 rounded cursor-pointer bg-transparent placeholder-white w-full col-span-1"
    //             placeholder="여행 날짜 선택"
    //             onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
    //             readOnly
    //           />
    //           <div className="relative w-full col-span-1">
    //             <button className="border border-white text-white px-4 py-2 rounded bg-transparent w-full" onClick={() => setIsPeopleOpen(!isPeopleOpen)}>인원 {adults}명</button>
    //             {isPeopleOpen && (
    //               <div className="absolute bg-gray-800 text-white p-2 border border-white rounded shadow w-full">
    //                 <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-2">-</button>
    //                 <span className="px-4">{adults}</span>
    //                 <button onClick={() => setAdults(adults + 1)} className="px-2">+</button>
    //               </div>
    //             )}
    //           </div>
    //           <button className="bg-blue-500 text-white px-4 py-2 rounded w-full col-span-1 text-sm">검색</button>
    //         </div>
    //       </section>
    //     </main>
  );
};

export default HomePage;
