import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { deleteBoard, deleteComment, getBoardDetail, hasLiked, insertComment, toggleLike, updateComment } from "../../services/boardLogic";
import { set } from "react-hook-form";

const TripReview = () => {
  const navigate = useNavigate();
  //params에서 가져와서 int로 바꾸기
  const { tb_no } = useParams();
  let prevDay = null; // 이전 tbd_day 값을 추적

  // 여행 데이터 상태 관리
  const [tripData, setTripData] = useState({}); // DB에서 불러올 게시글 정보 담기
  const [tripdetailData, setTripdetailData] = useState({});

  // 댓글 및 대댓글 상태 관리
  const [comments, setComments] = useState([]); // DB에서 불러올 댓글 정보 담기
  const [newComment, setNewComment] = useState(""); // 새로 입력하는 댓글
  const [parentc, setParentc] = useState(null); // 대댓글인 경우 부모댓글 번호 담기
  const [replyingTo, setReplyingTo] = useState(null); // 대댓글창 입력 여부 담기
  const [newReply, setNewReply] = useState(""); // 새로 입력하는 대댓글

  //댓글 수정 상태 관리
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 댓글 상태
  const [editedComment, setEditedComment] = useState(""); // 수정된 댓글 내용


  // 좋아요 상태 관리
  const [liked, setLiked] = useState(false); // 유저가 좋아요 눌렀는지 정보

  // ai코스 목업데이터(이후에 코스 불러오기 구현해야됨)
  const timeline = {
    ai: [
      { day: "Day 1 - 파리 도착", details: "샤를 드골 공항 도착, 호텔 체크인\n에펠탑 야경 감상" },
      { day: "Day 2 - 루브르 박물관", details: "루브르 박물관 관람\n세느강 크루즈" },
    ]
  };

  // 여행 정보 및 댓글 데이터 가져오기
  useEffect(() => {
    const Data = async () => {
      try {
        const boardData = await getBoardDetail(tb_no);
        //console.log(boardData);
        setTripData(boardData[0]);
        console.log(tripData);
        console.log("게시판 제목: " + tripData.tb_title);
        if (boardData[1].course) {
          setTripdetailData(boardData[1].course)
          console.log(tripdetailData);
        }
        if (boardData[2]) {
          setComments(boardData[2].comments);
          console.log(comments);
        }
      } catch (error) {
        console.error("상세 게시글 데이터 불러오기 실패: " + error);
      }
    }
    Data()
    userLike()
  }, [liked])
  // 게시글 수정 메소드
  const handleEditBoard = (tripData,tripdetailData) => { 
    console.log(tripData);
    console.log(tripdetailData);
    navigate("/boardedit", { state:  {tripData,tripdetailData} })
  }

  // 게시글 삭제 메소드
  const handleDeleteBoard = async (tb_no) => {
    try {
      const response = await deleteBoard(tb_no);
      console.log("게시글 삭제 결과" + response);
      // 게시글 삭제 후, 페이지 이동
      if(response === 1){
        alert("게시글이 삭제되었습니다.");
        navigate("/board");
      }
    } catch (error) {
      console.error("게시글 삭제 실패: " + error)
    }
  }
  // 유저가 좋아요 눌렀는지 확인하는 메소드
  const userLike = async () => {
    try {
      const LikeData = await hasLiked(tb_no, localStorage.user_id);
      console.log(localStorage.user_id + "좋아요 눌렀니?" + LikeData);
      setLiked(LikeData)
      return LikeData
    } catch (error) {
      console.error("좋아요 메소드 실패:" + error)
    }
  }

  // 좋아요 기능 (토글 기능 추가)
  const handleLike = async () => {
    try {
      const response = await toggleLike(tb_no, localStorage.user_id);
      console.log("좋아요 토글 결과" + response);
      userLike()
    } catch (error) {
      console.error("좋아요 토글 실패: " + error)
    }
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async () => {
    try {
      const commentdata = {
        "user_id": localStorage.user_id,
        "tb_no": tb_no,
        "tbc_comment": newComment
      };
      if (parentc) {
        commentdata.parent_tbc_no = parentc;
      }
      const commentinsert = await insertComment(commentdata)
      setNewComment(""); // 댓글 입력 필드 초기화
      // 댓글 목록 다시 가져오기 (새로고침 효과)
      const boardData = await getBoardDetail(tb_no);
      setComments(boardData[2].comments); // 댓글 목록을 새로 받아와서 업데이트
      return commentinsert
    } catch (error) {
      console.error("댓글 등록 실패:" + error)
    }
  };

  // 대댓글 창 열때마다 대댓글 입력 필드 초기화
  useEffect(() => {
    setNewReply(""); // 대댓글 입력 필드 초기화
  }, [replyingTo]); // replyingTo가 변경될 때마다 실행

  // 대댓글 작성 핸들러
  const handleReplySubmit = async (tbc_no) => {
    setParentc(tbc_no); // 부모 댓글 번호 설정
    try {
      const commentdata = {
        "user_id": localStorage.user_id,
        "tb_no": tb_no,
        "tbc_comment": newReply,
        "parent_tbc_no": tbc_no
      };
      const commentinsert = await insertComment(commentdata)
      setParentc(null); // 대댓글 확인용 부모댓글 번호 초기화
      setNewReply(""); // 대댓글 입력 필드 초기화
      setReplyingTo(null); // 대댓글창 닫기
      // 댓글 목록 다시 가져오기 (새로고침 효과)
      const boardData = await getBoardDetail(tb_no);
      setComments(boardData[2].comments); // 댓글 목록을 새로 받아와서 업데이트
      return commentinsert
    } catch (error) {
      console.error("댓글 등록 실패:" + error)
    }
  };

  //댓글 수정
  const handleEditComment = (comment) => {
    console.log("handleEditComment: " + comment);
    setEditingComment(comment); // 수정할 댓글 설정
    setEditedComment(comment.tbc_comment); // 수정할 댓글 내용 설정
  };

  const handleSaveEdit = async () => {
    try {
      const updatedCommentData = {
        tbc_comment: editedComment,
        tbc_no: editingComment.tbc_no // 대댓글도 수정되도록 설정
      };

      // 대댓글일 경우, 부모 댓글 번호도 포함하여 보내기
      if (editingComment.parent_tbc_no) {
        updatedCommentData.parent_tbc_no = editingComment.parent_tbc_no;
      }

      // 댓글 수정 API 호출
      const response = await updateComment(updatedCommentData);
      setEditingComment(null); // 수정 완료 후 수정 상태 초기화
      setEditedComment(""); // 수정된 댓글 내용 초기화

      // 댓글 목록 다시 가져오기
      const boardData = await getBoardDetail(tb_no);
      setComments(boardData[2].comments); // 댓글 목록 업데이트
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };


  // 댓글 삭제
  const handlecommentdelete = async (tbc_no) => {
    try {
      const c_delete_response = await deleteComment(tbc_no);
      // 댓글 목록 다시 가져오기 (새로고침 효과)
      const boardData = await getBoardDetail(tb_no);
      setComments(boardData[2].comments); // 댓글 목록을 새로 받아와서 업데이트
      return c_delete_response
    } catch (error) {
      console.error("댓글 삭제 실패:" + error)
    }

  }


  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-sm">
        <div className="p-8">
          {/* 여행 제목 및 작성자 정보 */}
          <header className="mb-8">
            {/* 제목 및 오른쪽 수정 / 삭제 버튼 */}
            <div className="flex items-center justify-between w-full">
              {/* 제목 (왼쪽 정렬) */}
              <h3 className="text-3xl font-bold text-gray-900">{tripData.tb_title}</h3>

              {/* 수정 / 삭제 버튼 (오른쪽 끝 정렬) */}
              {localStorage.user_id === tripData.user_id && (
                <div className="flex space-x-2">
                  <button className="text-sm text-gray-500"
                  onClick={() => handleEditBoard(tripData,tripdetailData)}
                  >
                    수정</button>
                  <button 
                  className="text-sm text-gray-500"
                  onClick={() => handleDeleteBoard(tb_no)}
                  >
                    삭제</button>
                </div>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <img
                src={`/images/icon_image/profile.png`} // 예시로, 사용자 ID에 맞는 이미지 경로 설정
                alt={tripData.user_id}
                className="w-10 h-10 border-[1.5px] border-gray-600 rounded-full" // 이미지 크기 및 둥근 모서리 설정
              />
              <span className="text-gray-500 ">{tripData.user_id}</span>
              <span>{tripData.tb_up_date}</span>
            </div>
          </header>

          {/* 여행 정보 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">여행지</h3>
              <p className="text-gray-600">{tripData.tb_country} {tripData.tb_city}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">여행 기간</h3>
              <p className="text-gray-600">{tripData.tb_departure_date} ~ {tripData.tb_return_date}</p>
            </div>
          </section>

          {/* 일정 타임라인 */}
          <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 md:col-span-2">일정 타임라인</h2>

            {/* AI 추천 일정 (왼쪽) */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 추천 일정</h3>
              {timeline.ai.map((item, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-orange-300">
                  <div className="absolute w-4 h-4 bg-orange-300 rounded-full -left-[9px] top-0"></div>
                  <h3 className="font-medium text-lg text-gray-900 mb-2">{item.day}</h3>
                  <p className="text-gray-600">{item.details}</p>
                </div>
              ))}
            </div>

            {/* 실제 여행 일정 (오른쪽) */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">실제 여행 일정</h3>
              {Array.isArray(tripdetailData) &&
                tripdetailData.map((item, index) => {
                  // tbd_day가 이전 값과 같지 않으면 표시
                  const shouldDisplayDay = item.tbd_day !== prevDay;
                  if (shouldDisplayDay) {
                    prevDay = item.tbd_day;
                  }
                  return (
                    <div key={index} className="relative pl-8 border-l-2 border-orange-300">
                      {shouldDisplayDay && (
                        <div className="absolute w-4 h-4 bg-orange-300 rounded-full -left-[9px] top-0"></div>
                      )}
                      {shouldDisplayDay && (
                        <h3 className="font-medium text-lg text-gray-900 mb-2">{`DAY ${item.tbd_day}`}</h3>
                      )}
                      <p className="text-gray-800">{item.tbd_time} {item.tbd_place}</p>
                      <p className="text-gray-600">{item.tbd_content}</p>
                      <p className="text-gray-600">🚘{item.tbd_time_car}🚌{item.tbd_time_public}</p>
                    </div>
                  );
                })}
            </div>
          </section>


          {/* 좋아요 기능 배치 */}
          <section className="mb-12 flex justify-end">
            <button
              className={`text-3xl font-medium px-3 py-1 rounded-lg shadow-md border border-gray-300 flex items-center space-x-2 ${liked ? "text-white bg-orange-300" : "text-gray-400 bg-white"}`}
              onClick={handleLike}
            >
              <img src={liked ? "/images/ui_image/clicklike.png" : "/images/ui_image/unclicklike.png"} alt="" className="w-[80px] h-[80px]" />
              {tripData.tb_like_count}
            </button>
          </section>

          {/* 댓글 입력 및 목록 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글</h2>
            <div className="flex items-center space-x-2">
              <textarea
                className="w-full border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-0 focus:outline-none"
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded-md whitespace-nowrap hover:scale-105"
                onClick={handleCommentSubmit}
              >
                댓글 작성
              </button>
            </div>
            {/* 댓글 목록 */}
            <div className="mt-6 space-y-4">
              {comments.map((comment) => {
                // 부모 댓글인지 확인
                const isReply = comment.parent_tbc_no !== null;
                if (!comment.parent_tbc_no) { // 대댓글이 아닌경우(원본)
                  return (
                    <div key={comment.tbc_no} className="border p-2 rounded-lg">
                      <div className="flex justify-between items-center mt-2 ml-2 mb-1 mr-2">
                        <p className="text-gray-700 mb-0">{comment.user_id}</p>
                        {/* 댓글 작성한 id가 로그인한 id와 같을 경우에만 수정,삭제 버튼 노출 */}
                        {comment.user_id === localStorage.user_id && (
                          <div className="flex space-x-2">
                            <button
                              className="text-sm text-gray-400 mb-0 rounded-lg hover:scale-105"
                              onClick={() => handleEditComment(comment)}
                            >
                              수정
                            </button>
                            <button
                              className="text-sm text-gray-400 mb-0 rounded-lg hover:scale-105"
                              onClick={() => handlecommentdelete(comment.tbc_no)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                      {/* 댓글 내용 수정 모드 */}
                      {editingComment?.tbc_no === comment.tbc_no ? (
                        <div className="mt-2">
                          <textarea
                            className="w-full border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-0 focus:outline-none"
                            value={editedComment}
                            onChange={(e) => setEditedComment(e.target.value)}
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                              onClick={() => setEditingComment(null)} // 수정 취소
                            >
                              취소
                            </button>
                            <button
                              className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                              onClick={handleSaveEdit} // 수정 저장
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 mt-2 mb-0 ml-2">{comment.tbc_comment}</p>
                      )}
                      {/* 답글 달기 버튼 */}
                      <div className="flex items-center justify-start  mt-0 mb-0 ">
                        <p className="text-gray-400 text-sm mt-3 ml-2 flex items-center justify-center">{comment.formatted_tbc_date}</p>
                        <button
                          className="text-sm text-orange-500 mt-0 mb-0 ml-2"
                          onClick={() => setReplyingTo(comment.tbc_no)}
                        >
                          답글 달기
                        </button>
                      </div>

                      {/* 대댓글 입력창 */}
                      {replyingTo === comment.tbc_no && (
                        <div className="mt-2 flex-row justify-end items-center">
                          <textarea
                            className="w-full border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-0 focus:outline-none"
                            placeholder="대댓글을 입력하세요..."
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                              onClick={() => setReplyingTo(null)}
                            >
                              취소
                            </button>
                            <button
                              className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                              onClick={() => handleReplySubmit(comment.tbc_no)}
                            >
                              등록
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                else if (comment.parent_tbc_no) { // 대댓글인 경우(DB에 부모댓글 번호가 존재)
                  return (
                    <div key={comment.tbc_no} className=" p-2 rounded-lg ml-12">
                      {/* 이미지 추가 부분 */}
                      <div className="flex items-center space-x-4">
                        <img
                          src={`/images/ui_image/arrow-right.png`}
                          alt={comment.user_id}
                          className="w-10 h-10" // 이미지 크기 및 둥근 모서리 설정
                        />
                        <div className="flex-1 border p-2 rounded-lg ml-12">
                          <div className="flex justify-between items-center mt-2 ml-2 mb-1 mr-2">
                            <p className="text-gray-700 mb-0">{comment.user_id}</p>
                            {/* 댓글 작성한 id가 로그인한 id와 같을 경우에만 수정,삭제 버튼 노출 */}
                            {comment.user_id === localStorage.user_id && (
                              <div className="flex space-x-2">
                                <button
                                  className="text-sm text-gray-400 mb-0 rounded-lg hover:scale-105"
                                  onClick={() => handleEditComment(comment)}
                                >
                                  수정
                                </button>
                                <button
                                  className="text-sm text-gray-400 mb-0 rounded-lg hover:scale-105"
                                  onClick={() => handlecommentdelete(comment.tbc_no)}
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                          {editingComment?.tbc_no === comment.tbc_no ? (
                            <div className="mt-2">
                              <textarea
                                className="w-full border-gray-300 rounded-lg p-2 focus:border-orange-500 focus:ring-0 focus:outline-none"
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                                  onClick={() => setEditingComment(null)} // 수정 취소
                                >
                                  취소
                                </button>
                                <button
                                  className="bg-orange-400 text-white px-3 py-1 rounded-lg"
                                  onClick={handleSaveEdit} // 수정 저장
                                >
                                  저장
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 mt-2 mb-0 ml-2">{comment.tbc_comment}</p>
                          )}
                          <p className="text-gray-400 text-sm mt-3 ml-2 flex items-center justify-start">{comment.formatted_tbc_date}</p>
                        </div>
                      </div>
                    </div>

                  )
                }
              })}
            </div>

          </section>
        </div>
      </article>
    </main>
  );
};

export default TripReview;
