import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import mainImg from "../../assets/여행지 이미지/한국/한국여행지.jpg";

const MainSection = ({ searchText, setSearchText }) => {
  const navigate = useNavigate(); // ✅ useNavigate 사용

  const handleSearch = () => {
    if (searchText.trim()) {
      // ✅ 검색어를 URL 파라미터로 포함하여 페이지 이동
      navigate(`/course?search=${encodeURIComponent(searchText)}`);
    }

    /* try {
      // 🔹 AI API 요청
      const response = await fetch("https://your-ai-api.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchText }),
      });

      const result = await response.json();

      // 🔹 검색 결과가 존재하는 경우, MainContent로 이동
      window.location.href("/course", { state: { searchText, aiResults: result } });
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 문제가 발생했습니다.");
    } */
  };

  return (
    <main className="pt-16">
      {/* ✅ 헤더와 간격 추가 + 글씨 배경 색상 추가 */}
      <h1 className="text-5xl font-bold mb-6 font-cute tracking-wide whitespace-nowrap text-center">
        <span className="bg-[rgba(186,230,253,0.5)] text-gray-900 px-6 py-3 rounded-md inline-block">
          {/* <span className="bg-sky-200 opacity-50 text-gray-900 px-6 py-3 rounded-md inline-block"> 글씨까지 적용이 되서 위에 처럼 배경색을 직접 적용 */}
          여울아~ 여행 코스 짜봐 이쁘게
        </span>
      </h1>

      <section className="relative bg-gray-900 h-[600px] overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src={mainImg}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="축제 배경"
        />

        {/* 메인 컨텐츠 */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10 text-white text-center">
          {/* ✅ 검색창 간격 조정 */}
          <div className="relative mx-auto w-96">
            <input
              type="text"
              placeholder="국가나 축제 이름을 검색하세요"
              className="rounded-md w-full py-4 px-6 text-gray-900 pr-12"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              className="rounded-md absolute right-2 top-1/2 transform -translate-y-1/2 bg-custom text-white p-2"
              onClick={handleSearch}
            >
              🔍
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MainSection;