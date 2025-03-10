import React from "react";
import MainSection from "./MainSection"; // 메인 배너
import ContinentList from "./ContinentList"; // 대륙별 여행지
import PopularFestivals from "./PopularFestivals"; // 인기 축제 섹션
import { useSearch } from "../../App"; // 🔹 검색 상태를 가져오기 위해 useSearch() 사용

const HomePage = () => {
  const { searchText, setSearchText } = useSearch(); // 🔹 검색 상태를 Context API에서 가져옴

  return (
    <>
      {/* ✅ 검색 상태를 MainSection에 전달 */}
      <MainSection searchText={searchText} setSearchText={setSearchText} />
      <ContinentList />
      <PopularFestivals />
    </>
  );
};

export default HomePage;
