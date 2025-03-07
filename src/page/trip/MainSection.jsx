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
      <section className="relative bg-gray-900 h-[600px] overflow-hidden">
        {/* 배경 이미지 */}
        <img
          src={mainImg}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="축제 배경"
        />

        {/* 메인 컨텐츠 */}
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              세계의 축제와 문화를 <br /> 경험하세요
            </h1>
            <p className="text-xl mb-8">
              전 세계의 다양한 문화와 축제를 통해 특별한 여행을 계획해보세요
            </p>

            {/* 검색창 */}
            <div className="relative">
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
        </div>
      </section>
    </main>
  );
};

export default MainSection;