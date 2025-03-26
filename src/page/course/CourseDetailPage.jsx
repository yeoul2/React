   import React, { useState, useEffect } from "react";
   import { useLocation, useNavigate, useParams } from "react-router-dom";
   import { deleteBoard, deleteComment, getBoardDetail, hasLiked, insertComment, toggleLike, updateComment } from "../../services/boardApi";
   import useStyle from "../../components/hooks/useStyle";
   import { csHasLiked, csToggleLike, getCourseDetail } from "../../services/courseLogic";

   const CourseDetailPage = () => {
   const { maskUserId } = useStyle();
   const navigate = useNavigate();
   const location = useLocation();
   //params에서 cs_no 가져오기
   const { cs_no } = useParams();

   // 여행 데이터 상태 관리
   const [courses, setCourses] = useState([]); // DB에서 불러올 게시글 정보 담기
   const [courseDetail, setCourseDetail] = useState({});
   // AI 코스 상태 관리 
   const [aiSchedule, setAiSchedule] = useState([
      { day: 1, place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
   ]);
   // 실제 일정 상태 관리
   const [actualSchedule, setActualSchedule] = useState([]);

   // 삭제 모달창 관리
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   // 좋아요 상태 관리
   const [liked, setLiked] = useState(false); // 유저가 좋아요 눌렀는지 정보
   const [likeCount, setLikeCount] = useState(0); // ✅ 추가: 좋아요 수 상태

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
         const boardData = await getCourseDetail(cs_no);
         console.log(boardData);
         setCourses(boardData[0]);
         setLikeCount(boardData[0].cs_like_count); // ✅ 추가: 좋아요 수 초기화
         console.log(boardData[0].cs_like_count);
         if (boardData[1].course) {
            setCourseDetail(boardData[1].course);
            setActualSchedule(
            Array.isArray(courseDetail)
               ? courseDetail.map(({ cdt_day, cdt_place, cdt_time, cdt_content }) => ({
                  day: cdt_day,
                  place: cdt_place,
                  time: cdt_time,
                  details: cdt_content,
               }))
               : []
            );
         }
         if (boardData[0].cs_no) {
            try {
            const courseData = await getCourseDetail(boardData[0].cs_no);
            if (courseData[1].details) {
               const courseDetailData = courseData[1].details;
               console.log(courseDetailData);
               setAiSchedule(courseDetailData?.map((element, index) => ({
                  day: element.cdt_day,
                  place: element.cdt_place,
                  time: element.cdt_time,
                  //details: element.tbd_content > cs_detail테이블에 내용 부분 없음
               }))
               )
            }

            } catch (error) {
            console.error("코스 데이터 불러오기 실패: " + error);

            }
         }
         if (boardData[1].course) {
            setCourseDetail(boardData[1].course)
            console.log(courseDetail);
         }
      } catch (error) {
         console.error("상세 게시글 데이터 불러오기 실패: " + error);
      }
      }
      Data()
      userLike()
   }, []) // ✅ liked 제거: handleLike 내부에서 처리

   // 삭제 버튼 클릭 시 모달 열기
   const handleOpenDeleteModal = () => {
      setShowDeleteModal(true);
   };

   // 게시글 삭제 메소드
   const handleDeleteBoard = async (cs_no) => {
      try {
      const response = await deleteBoard(cs_no)
      console.log("게시글 삭제 결과: " + response)

      // 게시글 삭제 후, 페이지 이동
      if (response === 1) {
         navigate("/board")
      }
      } catch (error) {
      console.error("게시글 삭제 실패: " + error)
      }
   }
   // 유저가 좋아요 눌렀는지 확인하는 메소드
   const userLike = async () => {
      try {
         const LikeData = await csHasLiked(cs_no, localStorage.user_id);
         setLiked(LikeData); // ✅ 상태만 반영
         return LikeData;
      } catch (error) {
         console.error("좋아요 메소드 실패:", error);
      }
   };

   // 좋아요 기능 (토글 기능 추가)
   const handleLike = async () => {
      try {
         const response = await csToggleLike(cs_no, localStorage.user_id);
         console.log("좋아요 토글 결과", response);
   
         const newLiked = !liked;
         setLiked(newLiked); // 상태 토글
   
         // ✅ 수치 반영은 여기서만 직접! userLike에선 하지 말기
         setLikeCount((prev) => newLiked ? prev + 1 : Math.max(prev - 1, 0));
   
      } catch (error) {
         console.error("좋아요 토글 실패:", error);
      }
   };


   return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-sm">
         <div className="p-8">
            {/* 여행 제목 및 작성자 정보 */}
            <header className="mb-8">
            {/* 제목과 버튼 그룹 */}
            <div className="flex items-center justify-between w-full">
               {/* 제목 (왼쪽 정렬) */}
               <h3 className="text-3xl font-bold text-gray-900">{courses.cs_name}</h3>
               {/* 버튼 그룹 (오른쪽 정렬, 세로 배치) */}
               <div className="flex flex-col items-end space-y-2">
                  {/* 목록 버튼 */}
                  <button
                  className="text-base text-white bg-orange-500 px-3 py-1 rounded-md hover:scale-105"
                  onClick={() => navigate(`/course_list?page=${new URLSearchParams(location.search).get("page") || 1}`)}
                  >
                  목록
                  </button>

                  {/* 수정 / 삭제 버튼 */}
                  {localStorage.user_id === courses.user_id && (
                  <div className="flex space-x-2">
                     <div>
                        {/* 삭제 확인 모달 */}
                        {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                           <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
                              <h3 className="text-lg font-semibold text-gray-900">정말 삭제하시겠습니까?</h3>
                              <p className="text-gray-500 text-sm mt-2">이 작업은 되돌릴 수 없습니다.</p>
                              <div className="mt-4 flex justify-center space-x-4">
                              <button
                                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                 onClick={() => setShowDeleteModal(false)}
                              >
                                 취소
                              </button>
                              <button
                                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                 onClick={() => handleDeleteBoard(cs_no)}
                              >
                                 삭제
                              </button>
                              </div>
                           </div>
                        </div>
                        )}
                     </div>
                  </div>
                  )}
               </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 space-x-4">
               <img
                  src={`/images/icon_image/profile.png`}
                  alt={courses.user_id}
                  className="w-10 h-10 border-[1.5px] border-gray-600 rounded-full" // 이미지 크기 및 둥근 모서리 설정
               />
               <span className="text-gray-500 ">{maskUserId(courses.user_id)}</span>
               <span>{courses.tb_up_date}</span>
            </div>
            </header>

            {/* 여행 정보 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
               <h3 className="text-lg font-medium text-gray-900 mb-2">여행지</h3>
               <p className="text-gray-600">{courses.cs_country} {courses.cs_city}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
               <h3 className="text-lg font-medium text-gray-900 mb-2">여행 기간</h3>
               <p className="text-gray-600">{courses.cs_departure_date} ~ {courses.cs_return_date}</p>
            </div>
            </section>

           {/* 일정 타임라인 섹션 */}
            <section className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">일정 타임라인</h2>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">AI 추천 일정</h3>

            {/* ✅ 스크롤 가능한 일정 목록 박스 */}
            <div className="max-h-[400px] overflow-y-auto px-4">
               {/* ✅ 3열 그리드로 일정 정렬 */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {aiSchedule.map((schedule, index) => (
                     <div
                        key={index}
                        className="relative border-t-2 border-orange-300 pt-4 px-6 py-4 min-h-[150px] min-w-[300px] bg-white shadow rounded"
                     >
                        {/* ✅ 타임라인 점 */}
                        <h3 className="font-medium text-lg text-gray-900 mb-2">
                           DAY {schedule.day}
                        </h3>
                        <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">{schedule.time}</p>
                        <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">{schedule.place}</p>
                        <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">{schedule.details}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>


            <section className="mb-12 flex justify-end">


            {/* 좋아요 버튼 배치 */}
            <div>
               <button
                  className={`text-3xl font-medium px-3 py-1 mt-5 rounded-lg shadow-md border border-gray-300 flex items-center space-x-2 ${liked ? "text-white bg-orange-300" : "text-gray-400 bg-white"}`}
                  onClick={handleLike}
               >
                  <img src={liked ? "/images/ui_image/clicklike.png" : "/images/ui_image/unclicklike.png"} alt="" className="w-[80px] h-[80px]" />
                  {likeCount} {/* ✅ 수정: courses.cs_like_count → likeCount */}
               </button>
            </div>
            </section>
         </div>
      </article>
      </main>
   );
   };

   export default CourseDetailPage;