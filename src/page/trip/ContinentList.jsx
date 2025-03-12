// ContinentList.jsx - 나라 목록 및 검색 기능 추가 (모달 추가, 검색 버튼 추가, UI 조정)
import React, { useState } from "react";
import korea from "../../assets/여행지 이미지/한국/불꽃놀이.jpg";
import japan from "../../assets/여행지 이미지/일본/훗카이도 시코쓰 호수 얼음 축제.jpg";
import italian from "../../assets/여행지 이미지/이탈리아/베로나 오페라 페스티벌.JPG";
import thailand from "../../assets/여행지 이미지/태국/코팡안 풀문 파티.JPG";
import maldives from "../../assets/여행지 이미지/몰디브/몰디브 전통 보트.JPG";
import usa from "../../assets/여행지 이미지/미국/뉴욕 타임스퀘어 새해맞이.JPG";

// 나라 정보 목록
const continents = [
  { name: "대한민국", image: korea, description: "한국의 멋진 여행지를 만나보세요." },
  { name: "일본", image: japan, description: "일본의 전통과 현대가 공존하는 여행지." },
  { name: "이탈리아", image: italian, description: "이탈리아의 아름다운 건축과 문화를 경험하세요." },
  { name: "태국", image: thailand, description: "태국의 이국적인 휴양지를 즐겨보세요." },
  { name: "몰디브", image: maldives, description: "몰디브의 환상적인 해변을 만나보세요." },
  { name: "미국", image: usa, description: "미국의 다양한 여행 명소를 탐방하세요." },
];

const ContinentList = () => {
  const [searchText, setSearchText] = useState(""); // 🔹 검색어 상태 관리
  const [selectedCountry, setSelectedCountry] = useState(null); // 🔹 모달 상태 관리

  // 🔹 검색어에 따라 나라 필터링
  const filteredContinents = continents.filter((c) =>
    c.name.includes(searchText)
  );

  const handleClick = (continent) => {
    setSelectedCountry(continent); // 🔹 나라 클릭 시 모달 열기
  };

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold mb-8">나라별 여행지</h2>

      {/* 🔹 검색 입력창 및 버튼 */}
      <div className="flex gap-2 mb-6">
      <input
        type="text"
        placeholder="나라 검색"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
          className="border rounded-md p-2 flex-grow"
      />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => setSearchText("")}>초기화</button>
      </div>

      {/* 🔹 나라 목록 표시 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {filteredContinents.map((continent, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleClick(continent)}
          >
            <img src={continent.image} className="w-full h-48 object-cover" alt={continent.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <span className="text-white font-medium">{continent.name}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 🔹 모달 창 */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-80">
            <h2 className="text-xl font-bold mb-2">{selectedCountry.name}</h2>
            <p className="mb-4">{selectedCountry.description}</p>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setSelectedCountry(null)}>닫기</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContinentList;
