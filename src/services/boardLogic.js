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
// 좋아요 정보 가져오기 (유저가 좋아요를 눌렀는지)
export const hasLiked = async (tb_no,user_id) => {
   console.log("tb_no: "+tb_no+", user_id: "+user_id);
   try {
      const response = await axios({
         method:"post",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/hasLiked`,
         data: {
            tb_no,
            user_id
         }
      })
      return response.data;
   } catch (error) {
      console.error("유저 좋아요 정보 가져오기 실패: "+error)
   }
}
// 좋아요 토글하기
export const toggleLike = async (tb_no,user_id) => {
   console.log("tb_no: "+tb_no+", user_id: "+user_id);
   try {
      const response = await axios({
         method:"post",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/toggleLike`,
         data: {
            tb_no,
            user_id
         }
      })
      return response.data;
   } catch (error) {
      console.error("유저 좋아요 토글 실패: "+error)
   }
}

// 댓글 추가하기
export const insertComment = async (comment) => {
   console.log(comment);
   try {
      const response = await axios({
         method:"post",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/commentInsert`,
         data: comment
      })
      return response.data;
   } catch (error) {
      console.error("댓글 추가 실패: "+error)
   }
}
// 댓글 수정하기
export const updateComment = async (comment) => {
   console.log(comment);
   try {
      const response = await axios({
         method:"put",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/commentUpdate`,
         data: comment
      })
      return response.data;
   } catch (error) {
      console.error("댓글 수정 실패: "+error)
   }
}
// 댓글 삭제하기
export const deleteComment = async (tbc_no) => {
   try {
      const response = await axios({
         method:"delete",
         url:`${process.env.REACT_APP_SPRING_IP}api/board/commentDelete`,
         params: {
            tbc_no
         }
      })
      return response.data;
   } catch (error) {
      console.error("댓글 삭제 실패: "+error)
   }
}