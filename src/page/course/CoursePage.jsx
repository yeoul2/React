import { useState, useEffect } from "react";
import axios from "axios";
import Select from 'react-select';
import useStyle from "../../components/hooks/useStyle";

export default function CourseBoard() {
   const {maskUserId,customStyles} = useStyle();
   const [courses, setCourses] = useState([]);
   const [searchFilter, setSearchFilter] = useState("코스이름"); // 기본 필터: 코스이름
   const [searchQuery, setSearchQuery] = useState(""); // 검색어 입력값
   const [searchTerm, setSearchTerm] = useState(""); // 실제 검색 실행 값
   const [sortOrder, setSortOrder] = useState("최신순"); // 정렬 기준
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1); // 🔹 총 페이지 수 추가
   const pageSize = 6;
   const sortOptions = [
      { value: "최신순", label: "최신순" },
      { value: "인기순", label: "인기순" }
   ];
   
   const themes = [
      { value: "도시 관광", label: "도시 관광", icon: "🏙️" },
      { value: "문화지 관광", label: "문화지 관광", icon: "🏛️" },
      { value: "랜드마크 투어", label: "랜드마크 투어", icon: "🗺️" },
      { value: "체험 중심 투어", label: "체험 중심 투어", icon: "🤝" },
      { value: "맛집 투어", label: "맛집 투어", icon: "🍽️" },
      { value: "쇼핑 투어", label: "쇼핑 투어", icon: "🛍️" },
      { value: "액티비티", label: "액티비티", icon: "🏃‍♂️" },
      { value: "효도 관광", label: "효도 관광", icon: "👴" },
      { value: "힐링", label: "힐링", icon: "🌿" },
      { value: "호캉스", label: "호캉스", icon: "🏨" },
      { value: "휴양", label: "휴양", icon: "🏖️" },
      { value: "반려동물과 함께", label: "반려동물과 함께", icon: "🐾" },
      { value: "명소 투어", label: "명소 투어", icon: "🔭" },
      { value: "축제 문화 투어", label: "축제 문화 투어", icon: "🎵" }
   ];
   
   useEffect(() => {
      axios.get(`/api/course/list`, {
         params: {
            order: sortOrder,
            search: searchFilter,
            keyword: searchTerm,
            page: page,
            pageSize: pageSize
         }
      })
      .then(response => {
         console.log("📌 API 응답:", response.data);
         if (response.data) {
            setCourses(response.data.courses || []);
            setTotalPages(response.data.totalPages || 1);
         }
      })
      .catch(error => {
         console.error("❌ 데이터 불러오기 실패:", error);
         setCourses([]);
         setTotalPages(1);
      });
   }, [sortOrder, searchTerm, page]);
   
   const handleThemeClick = (theme) => {
      setSearchTerm(theme);  // 검색어를 테마로 설정
   };
   

   return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* 검색 필터 */}
         <div className="flex gap-4 mb-6 justify-between">
            <Select
               value={{ value: searchFilter, label: searchFilter }}
               styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                     ...customStyles.control?.(provided, state),
                     minWidth: "130px",
                     height: "42px",
                  })
                  }}
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
               onKeyDown={(e) => e.key === "Enter" && setSearchTerm(searchQuery)
                  
               }
            />
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md"
               onClick={() => setSearchTerm(searchQuery)}>
               검색
            </button>
            <Select
               className="ml-auto"
               value={sortOptions.find((option) => option.value === sortOrder)}
               onChange={(selectedOption) => setSortOrder(selectedOption.value)}
               styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                     ...customStyles.control?.(provided, state),
                     minWidth: "130px",
                     height: "42px",
                  })
                  }}
               options={sortOptions}
               isSearchable={false}
            />
         </div>

{/* 🔹 테마 버튼 목록 */}
<div className="flex flex-wrap justify-center gap-3 mb-4">
   {themes.map((theme) => (
      <button
         key={theme.value}
         className={`flex flex-col items-center justify-center  border-2 rounded-lg shadow-md w-28 h-10 transition-colors duration-200
         border-gray-200 hover:bg-orange-500 hover:text-white`}
         onClick={() => handleThemeClick(theme.value)}
      >
         {/*<span className="text-xs">{theme.icon}</span>  */}
         <span className="text-xs font-semibold text-center mt-1 whitespace-nowrap">{theme.label}</span> 
         {/* ✅ `text-xs` → 텍스트 크기 줄여 가로 정렬 유지 */}
         {/* ✅ `whitespace-nowrap` → 자동 줄바꿈 방지 */}
      </button>
   ))}
</div>


         {/* 코스 목록 */}
         <div className="grid grid-cols-1 gap-6 mb-8">
            {courses.map(course => (
               <div key={course.cs_no} className="bg-white shadow p-4">
                  <h2 className="text-lg font-bold">{course.cs_name}</h2>
                  <p className="text-sm text-gray-600">{course.cs_country}</p>
               </div>
            ))}
         </div>

         {/* 페이지네이션 */}
         <div className="flex justify-center items-center space-x-2 mt-4">
            {/* 이전 버튼 */}
            <button 
               className="border px-4 py-2 disabled:opacity-50" 
               onClick={() => setPage(prev => Math.max(prev - 1, 1))}
               disabled={page === 1}
            >
               이전
            </button>

            {/* 동적으로 페이지 번호 생성 */}
            {[...Array(totalPages)].map((_, index) => (
               <button 
                  key={index} 
                  className={`px-3 py-2 border ${page === index + 1 ? "bg-gray-900 text-white" : ""}`} 
                  onClick={() => setPage(index + 1)}
               >
                  {index + 1}
               </button>
            ))}

            {/* 다음 버튼 */}
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
