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
};

