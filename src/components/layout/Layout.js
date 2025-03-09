import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../includes/Header"; // ✅ 헤더 추가
import Footer from "../includes/Footer"; // ✅ 푸터 추가
import { useSearch } from "../../App"; // ✅ 검색 상태 가져오기

const Layout = ({ children }) => {
  const location = useLocation();
  const { setSearchText } = useSearch(); // ✅ 검색어 초기화 함수 가져오기

  // ✅ 헤더/푸터가 필요 없는 페이지 목록
  const shouldHideHeaderFooter = [
    "/login",
    "/signup",
    "/find-id",
    "/find-pw",
    "/mypage-check",
  ].includes(location.pathname);

  return (
    <div className={`min-h-screen ${shouldHideHeaderFooter ? "mt-0" : "mt-16"}`}>
      {!shouldHideHeaderFooter && <Header resetSearch={() => setSearchText("")} />}
      {/* ✅ Header에 검색어 초기화 함수 전달 */}
      {children}
      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
};

export default Layout;
