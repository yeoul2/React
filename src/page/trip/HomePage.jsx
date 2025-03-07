import React from "react";
import MainSection from "./MainSection"; // 메인 배너
import ContinentList from "./ContinentList"; // 대륙별 여행지
import PopularFestivals from "./PopularFestivals"; // 인기 축제 섹션

const HomePage = ({ searchText, setSearchText }) => {
  return (
    <>
      <MainSection searchText={searchText} setSearchText={setSearchText} />
      <ContinentList />
      <PopularFestivals />
    </>
  )
}

export default HomePage