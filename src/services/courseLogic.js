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
         url: `${process.env.REACT_APP_SPRING_IP}api/course/detail`,
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

// 코스 삭제하기
export const deleteCourse = async (cs_no) => {
   try {
      const accessToken = localStorage.getItem("accessToken") // 토큰가져오기

      const response = await axios({
         method: "delete",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/delete`,
         params: {
            cs_no
         },
         headers: {
            Authorization: `Bearer ${accessToken}`, // ✅ 토큰 붙이기
         }
      });
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("코스 삭제 실패: ", error);
   }
}

// user_id 로 코스 조회하기
export const getCourseByUserId = async (user_id) => {
   try {
      const response = await axios({
         method: "get",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/getUserCourse`,
         params: {
            user_id
         }
      });
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("코스 가져오기 실패: ", error);
   }
}

// 코스 공유하기
export const shareCourse = async (cs_no) => {
   try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios({
         method: "put",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/shareCourse`,
         params: {
            cs_no
         },
         headers: {
            Authorization: `Bearer ${accessToken}`
         }
      });
      console.log(response.data);
      return response.data;
   } catch (error) {
      console.error("코스 공유 실패: ", error);
   }
}

