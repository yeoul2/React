import axios from "axios";

//코스조회 하기
export const getCourseList = async (sortOrder,searchFilter,searchTerm,page,pageSize) => {
   console.log(sortOrder,searchFilter,searchTerm,page,pageSize);
   try {
      const response = await axios({
         method: "get",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/list`,
         params: {
            order: sortOrder,         // ✅ 정렬 유지
            search: searchFilter,     // ✅ 검색 필터 유지
            keyword: searchTerm,      // ✅ 검색어 유지
            page: page,               // ✅ 페이지 유지
            pageSize: pageSize
         }
      });
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("코스 가져오기 실패: ", error);
   }
}

//코스상세 조회하기
export const getCourseDetail = async (cs_no) => {
   try {
      const response = await axios({
         method: "get",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/detail/`,
         params: {
            cs_no
         }
      });
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("코스 상세 정보 가져오기 실패: ", error);
   }
}

