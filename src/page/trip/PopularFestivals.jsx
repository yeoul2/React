import React, { useEffect, useRef } from "react";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css"; // Glide 스타일 추가
import "@glidejs/glide/dist/css/glide.theme.min.css"; // 추가 스타일 (선택)
import korea from "../../assets/여행지 이미지/한국/불꽃놀이.jpg"
import japan from "../../assets/여행지 이미지/일본/훗카이도 시코쓰 호수 얼음 축제.jpg"
import italian from "../../assets/여행지 이미지/이탈리아/베로나 오페라 페스티벌.JPG"
import thailand from "../../assets/여행지 이미지/태국/코팡안 풀문 파티.JPG"
import maldives from "../../assets/여행지 이미지/몰디브/몰디브 전통 보트.JPG"
import usa from "../../assets/여행지 이미지/미국/뉴욕 타임스퀘어 새해맞이.JPG"

const festivalData = [
  {
    title: "서울 국제 폭죽 축제",
    location: "대한민국 서울",
    image: korea,
  },

  {
    title: "얼음 축제",
    location: "일본 도쿄",
    image: japan,
  },
  
  {
    title: "오페라 축제",
    location: "이탈리아 로마",
    image: italian,
  },

  {
    title: "코팡안 풀문 파티",
    location: "태국 방콕",
    image: thailand,
  },

  {
    title: "전토 보트",
    location: "몰디브 말레",
    image: maldives,
  },

  {
    title: "타임스퀘어 새해맞이",
    location: "미국 워싱턴 D.C.",
    image: usa,
  },
];

const PopularFestivals = () => {
  const glideRef = useRef(null);

  useEffect(() => {
    const glide = new Glide(glideRef.current, {
      type: "carousel",
      perView: 3, // 한 번에 하나의 축제만 보여줌
      focusAt: "center",
      gap: 20, // 슬라이드 간격
      breakpoints: {
        1024: { perView: 2 }, // 화면이 1024px 이하일 때 2개 표시
        768: { perView: 1 },  // 화면이 768px 이하일 때 1개 표시
      },
    });

    glide.mount(); // Glide 초기화
    return () => glide.destroy(); // 컴포넌트 언마운트 시 Glide 제거
  }, []);

  return (
    <section className="bg-white py-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">인기 축제</h2>
        <div ref={glideRef} className="glide">
          {/* 슬라이드 트랙 */}
          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides">
              {festivalData.map((festival, index) => (
                <li key={index} className="glide__slide">
                  <div className="rounded-lg overflow-hidden">
                    <img src={festival.image} className="w-full h-80 object-cover" alt={festival.title} />
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-lg mb-2">{festival.title}</h3>
                      <p className="text-gray-600">{festival.location}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ 추가: 좌우 이동 버튼 */}
          <div className="glide__arrows" data-glide-el="controls">
            <button
              className="glide__arrow glide__arrow--left bg-black text-white p-2 rounded-full"
              data-glide-dir="<"
            >
              ◀
            </button>
            <button
              className="glide__arrow glide__arrow--right bg-black text-white p-2 rounded-full"
              data-glide-dir=">"
            >
              ▶
            </button>
          </div>

          {/* 슬라이드 네비게이션 (버튼) */}
          <div className="glide__bullets" data-glide-el="controls[nav]">
            {festivalData.map((_, index) => (
              <button
                key={index}
                className="glide__bullet"
                data-glide-dir={`=${index}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularFestivals;
