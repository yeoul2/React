import React, { useState, useEffect } from "react";
import api from "../../services/axiosInstance"; // 백엔드 API 연결을 위한 axios 설정
import { getCourseList } from "../../services/courseLogic";

const CourseBoard = () => {
const [courses, setCourses] = useState([]); // 게시글 목록
const [filter, setFilter] = useState({
   country: "전체",
   duration: "전체",
   search: "",
});

useEffect(() => {
   fetchCourses();
}, []);

//DB에서 코스정보 가져오기
const fetchCourses = async () => {
   try {
   const courseData = await getCourseList(); // 백엔드 API 호출
   console.log(courseData);
   setCourses(courseData)
   } catch (error) {
   console.error("데이터 불러오기 오류:", error);
   }
};

const handleFilterChange = (e) => {
   setFilter({ ...filter, [e.target.name]: e.target.value });
};

const filteredCourses = courses.filter((course) => {
   return (
   (filter.country === "전체" || course.country === filter.country) &&
   (filter.duration === "전체" || course.duration === filter.duration) &&
   (filter.search === "" || course.title.includes(filter.search))
   );
});

return (
   <div className="min-h-screen bg-gray-50 font-sans">
   {/* 네비게이션 바 */}
   <nav className="bg-white shadow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between h-16">
         <div className="flex-shrink-0 flex items-center">
            <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
         </div>
         <div className="flex items-center">
            <button className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
               로그인
            </button>
         </div>
         </div>
      </div>
   </nav>

   {/* 메인 컨텐츠 */}
   <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
         <h1 className="text-3xl font-bold text-gray-900">여행 코스 공유 게시판</h1>
         <button className="rounded-md bg-indigo-600 text-white px-6 py-2.5 font-medium hover:bg-indigo-700">
         <i className="fas fa-pen mr-2"></i>글쓰기
         </button>
      </div>

      {/* 필터 박스 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">나라</label>
            <select name="country" onChange={handleFilterChange} className="rounded-md w-full border-gray-300 focus:ring-indigo-500">
               <option>전체</option>
               <option>일본</option>
               <option>베트남</option>
               <option>태국</option>
            </select>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">여행 기간</label>
            <select name="duration" onChange={handleFilterChange} className="rounded-md w-full border-gray-300 focus:ring-indigo-500">
               <option>전체</option>
               <option>당일</option>
               <option>1박 2일</option>
               <option>2박 3일</option>
               <option>3박 이상</option>
            </select>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <input
               type="text"
               name="search"
               onChange={handleFilterChange}
               className="rounded-md w-full border-gray-300 focus:ring-indigo-500 pl-3"
               placeholder="검색어를 입력하세요"
            />
         </div>
         </div>
      </div>

      {/* 게시글 목록 */}
      <div className="grid grid-cols-1 gap-6 mb-8">
         {filteredCourses.map((course) => (
         <article key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
               <div className="md:flex-shrink-0">
               <img className="h-48 w-full md:w-48 object-cover" src={course.image} alt={course.title} />
               </div>
               <div className="p-6">
               <div className="flex items-center mb-2">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">추천</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">{course.country}</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">{course.duration}</span>
               </div>
               <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
               <p className="text-gray-600 mb-4">{course.description}</p>
               <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{course.author}</span>
                  <div className="flex items-center">
                     <i className="fas fa-heart text-red-400 mr-1"></i>
                     <span className="text-sm text-gray-600">{course.likes}</span>
                  </div>
               </div>
               </div>
            </div>
         </article>
         ))}
      </div>
   </main>

   {/* 푸터 */}
   <footer className="bg-white mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <div className="text-center text-gray-500 text-sm">
         © 2024 AI 여행 추천 서비스. All rights reserved.
         </div>
      </div>
   </footer>
   </div>
);
};

export default CourseBoard;
