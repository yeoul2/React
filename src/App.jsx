import React, { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/includes/Header";
import Footer from "./components/includes/Footer";
import HomePage from "./page/trip/HomePage";
import PlannerPage from "./page/planner/PlannerPage";
import LoginPage from "./page/auth/LoginPage";
import SignupPage from "./page/auth/SignupPage";
import FindPassword from "./page/auth/FindPassword";
import FindId from "./page/auth/FindId";
import TravelPage from "./page/notice/TravelPage";
import TravelReviewForm from "./page/notice/TravelReviewForm";
import "./index.css";
import MypageCheck from "./page/auth/MypageCheck";

const Layout = ({ children, resetSearch }) => {
  const location = useLocation();
  const shouldHideHeaderFooter = ["/login", "/signup", "/find-id", "/find-pw", "/mypage-check"].some(path => location.pathname.startsWith(path));

  return (
    <>
      {!shouldHideHeaderFooter && <Header resetSearch={resetSearch} />}
      {children}
      {!shouldHideHeaderFooter && <Footer />}
    </>
  );
};

const App = () => {
  const [searchText, setSearchText] = useState(""); // 🔹 검색어 상태 추가

  return (
    <BrowserRouter>
      <Layout resetSearch={() => setSearchText("")}> {/* 🔹 검색어 초기화 함수 전달 */}
        <Routes>
          <Route path="/" element={<HomePage searchText={searchText} setSearchText={setSearchText} />} />
          <Route path="/course" element={<PlannerPage />} />
          <Route path="/community" element={<TravelPage />} />
          <Route path="/write" element={<TravelReviewForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-pw" element={<FindPassword />} />
          <Route path="/find-id" element={<FindId />} />
          <Route path="/mypage-check" element={<MypageCheck />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
