import axios from "axios";

//코스조회 하기
export const getCourseList = async () => {
   try {
      const response = await axios({
         method: "get",
         url: `${process.env.REACT_APP_SPRING_IP}api/course/list`
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

