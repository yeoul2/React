import React, { useState, createContext, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout"; // ✅ Layout 가져오기
import HomePage from "./page/trip/HomePage";
import PlannerPage from "./page/planner/PlannerPage";
import LoginPage from "./page/auth/LoginPage";
import SignupPage from "./page/auth/SignupPage";
import FindPassword from "./page/auth/FindPassword";
import FindId from "./page/auth/FindId";
import TravelPage from "./page/notice/TravelPage";
import TravelReviewForm from "./page/notice/TravelReviewForm";
import MypageCheck from "./page/auth/MypageCheck";
import "./index.css";
import TripReview from "./page/notice/TripReview";
import GoogleAuthCallback from "./page/auth/social/GoogleAuthCallback";
import NaverAuthCallback from "./page/auth/social/NaverAuthCallback";
import MyPage from "./page/auth/MyPage";


// ✅ 검색 상태를 전역 관리하는 Context 생성
const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

const App = () => {
  const [searchText, setSearchText] = useState(""); // ✅ 검색 상태를 Context에서 관리

  return (
    <SearchContext.Provider value={{ searchText, setSearchText }}>
      <BrowserRouter>
        <Layout> {/* ✅ Layout을 감싸서 자동으로 Header, Footer 적용 */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course" element={<PlannerPage />} />
            {/* Google OAuth 콜백 경로 추가 */}
            <Route path="/google/callback" element={<GoogleAuthCallback />} /> 
            {/* Naver OAuth 콜백 경로 추가 */}
            <Route path="/naver/callback" element={<NaverAuthCallback/>} />
            <Route path="/board" element={<TravelPage />} />
            <Route path="/board/:tb_no" element={<TripReview />} />
            <Route path="/write" element={<TravelReviewForm />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-pw" element={<FindPassword />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/mypage-check" element={<MypageCheck />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SearchContext.Provider>
  );
};

export default App;