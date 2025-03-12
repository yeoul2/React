import axios from "axios";

// 게시판 갯수 가져오기
export const getBoardCount = async (search,keyword) => {
   console.log(search,keyword);
   try {
      const response = await axios({
         method:"get", 
         url:`${process.env.REACT_APP_SPRING_IP}api/board/tripboardCount`,
         params: {
            search,
            keyword
         }
      })
      console.log("게시글 갯수: "+response.data);
      return response.data;
   }
   catch (error) {
      console.error("게시판 갯수 가져오기 실패: ", error);
   }
}
// 게시판 리스트 가져오기
export const getBoardList = async (order,search,keyword,page) => {
   console.log(order,search,keyword,page);
   try {
      const response = await axios({
         method:"get", 
         url:`${process.env.REACT_APP_SPRING_IP}api/board/tripboardList`,
         params: {
            order,
            search,
            keyword,
            page
         }
      })
      return response.data;
   }
   catch (error) {
      console.error("게시판 가져오기 실패: ", error);
   }
}
// 게시판 상세 가져오기 (상세 게시글 조회, 코스/댓글도 함께 가져옴)
export const getBoardDetail = async (tb_no) => {
   console.log("게시판 번호: "+tb_no);
   try {
      const response = await axios({
         method:"get",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/tripboardDetail`,
         params: {
            tb_no
         }
      })
      return response.data;
   } catch (error) {
      console.error("상세 게시글 가져오기 실패: "+error);
   }
}

// 댓글 추가하기
export const insertComment = async (comment) => {
   console.log("삽입할 댓글 데이터: "+comment);
   try {
      const response = await axios({
         method:"post",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/commentInsert`,
         data: comment
      })
      return response.data;
   } catch (error) {
      
   }
}