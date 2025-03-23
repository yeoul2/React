import { useState, useEffect } from "react";
import axios from "axios";
import Select from 'react-select';
import useStyle from "../../components/hooks/useStyle";
import { getCourseList } from "../../services/courseLogic";
import { useNavigate } from "react-router-dom";// ✅ useNavigate 추가 디테일 이동을 위해서


export default function CourseBoard() {
   const navigate = useNavigate();// ✅ useNavigate 사용 선언
   const ImgPath = "/images/ui_image/"
   const [travelStyle, setTravelStyle] = useState([]); // 여행 스타일 선택
   const { maskUserId, customStyles } = useStyle();
   const [courses, setCourses] = useState([]);
   const [searchFilter, setSearchFilter] = useState("코스이름");
   const [searchQuery, setSearchQuery] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
   const [sortOrder, setSortOrder] = useState("최신순");
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const pageSize = 6;


   const sortOptions = [
      { value: "최신순", label: "최신순" },
      { value: "인기순", label: "인기순" }
   ];

   const toggleTravelStyle = (id) => {
      setTravelStyle((prev) => {
         if (prev.includes(id)) return prev.filter((style) => style !== id);
         if (prev.length < 6) return [...prev, id];
         return prev;
         });
      };


     // 📌 여행 스타일 선택 및 해제 기능 (최대 6개 선택 가능)
   const travelStyles = [
      { id: "도시 관광", icon: "fas fa-city" },
      { id: "문화지 관광", icon: "fas fa-landmark" },
      { id: "랜드마크 투어", icon: "fas fa-map-marked-alt" },
      { id: "체험 중심 투어", icon: "fas fa-hands-helping" },
      { id: "맛집 투어", icon: "fas fa-utensils" },
      { id: "쇼핑 투어", icon: "fas fa-shopping-bag" },
      { id: "액티비티", icon: "fas fa-running" },
      { id: "효도 관광", icon: "fas fa-user-friends" },
      { id: "힐링", icon: "fas fa-spa" },
      { id: "호캉스", icon: "fas fa-hotel" },
      { id: "휴양", icon: "fas fa-umbrella-beach" },
      { id: "반려동물과 함께", icon: "fas fa-paw" },
      { id: "명소 투어", icon: "fas fa-binoculars" },
      { id: "축제 문화 투어", icon: "fas fa-music" },
   ];

// ✅ (1) 코스 데이터를 불러오는 함수 (기존 유지)
const fetchCourses = async () => {
   try {

      console.log("📦 요청 파라미터:", {
         order: sortOrder,
         search: searchFilter,
         keyword: searchTerm,
         page: page,
         pageSize: pageSize
      });

      const data = await getCourseList(
         sortOrder,
         searchFilter,
         searchTerm,
         page,
         pageSize
      );

      if (data) {
         setCourses(data.courses || []); // ✅ 최신 데이터로 업데이트
         setTotalPages(data.totalPages || 1);
      }
   } catch (error) {
      console.error("❌ 데이터 불러오기 실패:", error);
   }
};
   

   useEffect(() => {
      fetchCourses(); // ✅ 기존 기능 유지
   }, [sortOrder, searchTerm, page]);


   const handleThemeClick = (theme) => {
      setSearchTerm(theme);
   };

   return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

         {/* 검색 필터 */}
         <div className="flex gap-4 mb-6 justify-between">
            <Select
               value={{ value: searchFilter, label: searchFilter }}
               styles={customStyles}
               onChange={(e) => setSearchFilter(e.value)}
               options={[
                  { value: "코스이름", label: "코스이름" },
                  { value: "나라", label: "나라" }
               ]}
               isSearchable={false}
            />
            <input
               type="text"
               className="h-[42px] border-[1px] border-orange-300 px-4 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500"
               placeholder="검색어 입력"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && setSearchTerm(searchQuery)}
            />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md"
               onClick={() => setSearchTerm(searchQuery)}>
               검색
            </button>
            <Select
               className="ml-auto"
               value={sortOptions.find((option) => option.value === sortOrder)}
               onChange={(selectedOption) => setSortOrder(selectedOption.value)}
               styles={customStyles}
               options={sortOptions}
               isSearchable={false}
            />
         </div>

         {/* 여행 테마 선택 */}
         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
         {travelStyles.map((style) => (
         <button
            key={style.id}
            className={`flex flex-col items-center p-1 border rounded-lg shadow-md w-full transition-colors duration-200 max-w-[90px] ${travelStyle.includes(style.id) ? 'border-orange-500' : 'border-gray-200'}`}
            onClick={() => toggleTravelStyle(style.id)}
         >
            <i className={`${style.icon} text-lg mb-0.5 ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}></i>
            <span className={`text-[10px] font-medium ${travelStyle.includes(style.id) ? 'text-orange-500' : 'text-black'}`}>{style.id}</span>
         </button>
         ))}
      </div>


         {/* 코스 목록 */}
         <div className="grid grid-cols-1 gap-3 mb-8">
            {courses.map(course => (
               <div key={course.cs_no} className="bg-white shadow p-4  flex w-full justify-between cursor-pointer hover:bg-gray-50 "
               onClick={(e) => {
                  // 좋아요 버튼처럼 이벤트 버블링 막고 싶은 요소가 있다면 예외 처리
                  if (e.target.closest(".no-navigate")) return;
                  navigate(`/course_list/${course.cs_no}`);
               }}// 코스 목록 안에 항목에 커서 올렸을때 커서 바뀌고 클릭시 코스 디테일로 이동하는
               >

                  <div className="flex items-center justify-center">
                     {/* 왼쪽 이미지 영역 */}
                     <div className="w-40 h-40 bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">이미지</span>
                     </div>
                     {/* 왼쪽 이미지 영역 끝 */}
                     {/* 중앙 영역 */}
                     <div className="ml-4 flex-col">
                        <p>{course.cs_name}</p>
                        <p>내용</p>
                        <p className="text-[10px] text-black-500 mr-80 ">{maskUserId(course.user_id)}  |  {course.cs_up_date}</p>{/* 코스 업데이트 날짜 */}
                     </div>
                  </div>
                  {/* 중앙 영역 끝 */}
                  {/* 오른쪽 아래영역 */}
                  
                  <div className="flex justify-end items-end mt_auto">
                  <img src={`${ImgPath}clicklike.png`} alt="" className="w-[30px] h-[30px]" />{/* ✅ 좋아요이미지 */}
                  <span className="text-orange-500 ml-2 fa-solid"> {course.cs_like_count}</span>{/* 좋아요표시 */}
                  {/* 오른쪽 아래영역 끝*/}
                  </div>
               </div>
            ))}
         </div>

         {/* 페이지네이션 */}
         <div className="flex justify-center items-center space-x-2 mt-4">
            <button 
               className="border px-4 py-2 disabled:opacity-50" 
               onClick={() => setPage(prev => Math.max(prev - 1, 1))}
               disabled={page === 1}
            >
               이전
            </button>
            {[...Array(totalPages)].map((_, index) => (
               <button 
                  key={index} 
                  className={`px-3 py-2 border ${page === index + 1 ? "bg-gray-900 text-white" : ""}`} 
                  onClick={() => setPage(index + 1)}
               >
                  {index + 1}
               </button>
            ))}
            <button 
               className="border px-4 py-2 disabled:opacity-50" 
               onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
               disabled={page === totalPages}
            >
               다음
            </button>
         </div>
      </div>
   );
}
