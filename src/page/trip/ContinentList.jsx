import React from "react";
import korea from "../../assets/여행지 이미지/한국/불꽃놀이.jpg"
import japan from "../../assets/여행지 이미지/일본/훗카이도 시코쓰 호수 얼음 축제.jpg"
import italian from "../../assets/여행지 이미지/이탈리아/베로나 오페라 페스티벌.JPG"
import thailand from "../../assets/여행지 이미지/태국/코팡안 풀문 파티.JPG"
import maldives from "../../assets/여행지 이미지/몰디브/몰디브 전통 보트.JPG"
import usa from "../../assets/여행지 이미지/미국/뉴욕 타임스퀘어 새해맞이.JPG"

const continents = [
  {
    name: "대한민국",
    image: korea,
  },
  
  {
    name: "일본",
    image: japan,
  },

  {
    name: "이탈리아",
    image: italian,
  },

  {
    name: "태국",
    image: thailand,
  },

  {
    name: "몰디브",
    image: maldives,
  },
  
  {
    name: "미국",
    image: usa,
  },
];

const ContinentList = () => {
  const handleClick = (continent) => {
    alert(`${continent} 여행지를 탐색하세요!`); // 이후 실제 네비게이션 추가 가능
  };

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold mb-8">나라별 여행지</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {continents.map((continent, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleClick(continent.name)}
          >
            <img src={continent.image} className="w-full h-48 object-cover" alt={continent.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <span className="text-white font-medium">{continent.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinentList;
