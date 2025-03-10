import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TripReview = () => {
  const { id } = useParams(); // URL에서 게시글 ID 가져오기

  // 여행 데이터 상태 관리
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 댓글 및 대댓글 상태 관리
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState("");

  // 좋아요 상태 관리
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  // 여행 정보 및 댓글 데이터 가져오기
  useEffect(() => {
    // 🚀 더미 데이터 사용하여 테스트
    const mockData = {
      title: "파리 7일간의 로맨틱 여행",
      author: "traveler123",
      date: "2024.02.15",
      location: "프랑스 파리",
      duration: "2024.01.15 - 2024.01.21",
      timeline: {
        ai: [
          { day: "Day 1 - 파리 도착", details: "샤를 드골 공항 도착, 호텔 체크인\n에펠탑 야경 감상" },
          { day: "Day 2 - 루브르 박물관", details: "루브르 박물관 관람\n세느강 크루즈" },
        ],
        real: [
          { day: "Day 1 - 파리 도착", details: "공항 도착 후 호텔 체크인\n몽마르트 언덕 산책" },
          { day: "Day 2 - 오르세 미술관", details: "오르세 미술관 관람\n에펠탑 야경" },
        ],
      },
      photos: [
        { url: "/images/korea_id.jpg", id: 1 },
        { url: "/images/korea_sig.jpg", id: 1 },
        { url: "/images/korea_trip.jpg", id: 1 },
      ],
      review: "파리는 정말 로맨틱한 도시였습니다.",
    };

    const mockComments = [
      { id: 1, text: "정말 멋진 후기네요!", replies: [] },
      { id: 2, text: "저도 파리 다녀왔는데 정말 좋았어요!", replies: [{ id: 3, text: "맞아요! 분위기가 정말 좋아요." }] },
    ];

    // 1초 뒤에 데이터를 불러온 것처럼 설정
    setTimeout(() => {
      setTripData(mockData);
      setComments(mockComments);
      setLoading(false);
    }, 1000);
    /* 
    const fetchTripData = async () => {
      try {
        // 백엔드 API 호출 (예: http://localhost:8080/api/trips/{id})
        const response = await axios.get(`http://localhost:7007/api/trips/${id}`);
        setTripData(response.data);
        setComments(response.data.comments || []); // 댓글 데이터 초기화
      } catch (error) {
        console.error("데이터 불러오기 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
     */
  }, [id]);

  // 댓글 작성 핸들러
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(`http://localhost:7007/api/trips/${id}/comments`, {
        text: newComment,
      });

      // 새로운 댓글을 상태에 추가
      setComments((prevComments) => [...prevComments, { ...response.data, replies: [] }]);
      setNewComment(""); // 입력창 초기화
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  };

  // 대댓글 작성 핸들러
  const handleReplySubmit = async (parentId) => {
    if (!newReply.trim()) return;
    try {
      const response = await axios.post(`http://localhost:7007/api/trips/${id}/comments/${parentId}/reply`, {
        text: newReply,
      });

      // 대댓글을 해당 댓글의 replies에 추가
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), response.data] }
            : comment
        )
      );

      setNewReply(""); // 입력창 초기화
      setReplyingTo(null); // 대댓글 입력창 닫기
    } catch (error) {
      console.error("대댓글 작성 오류:", error);
    }
  };

  // 좋아요 기능 (토글 기능 추가)
  const handleLike = () => {
    setLiked((prevLiked) => !prevLiked);
    setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));
  };

  if (loading) {
    return <p className="text-center text-gray-500">로딩 중...</p>;
  }

  if (!tripData) {
    return <p className="text-center text-red-500">데이터를 불러오지 못했습니다.</p>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-sm">
        <div className="p-8">
          {/* 여행 제목 및 작성자 정보 */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{tripData.title}</h1>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span className="text-gray-500">{tripData.author}</span>
              <span>{tripData.date}</span>
            </div>
          </header>

          {/* 여행 정보 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">여행지</h3>
              <p className="text-gray-600">{tripData.location}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">여행 기간</h3>
              <p className="text-gray-600">{tripData.duration}</p>
            </div>
          </section>

          {/* 일정 타임라인 */}
          <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 md:col-span-2">일정 타임라인</h2>
            {Object.entries(tripData.timeline).map(([key, data]) => (
              <div key={key} className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {key === "ai" ? "AI 추천 일정" : "실제 여행 일정"}
                </h3>
                {data.map((item, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-gray-300">
                    <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-0"></div>
                    <h3 className="font-medium text-lg text-gray-900 mb-2">{item.day}</h3>
                    <p className="text-gray-600">{item.details}</p>
                  </div>
                ))}
              </div>
            ))}
          </section>

          {/* 여행 후기 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">여행 후기</h2>
            <p className="text-gray-600">{tripData.review}</p>
          </section>

          {/* 여행 사진 & 동영상 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">여행 사진 & 동영상</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripData.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <img src={photo.url} alt="여행 사진" className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </section>

          {/* 좋아요 기능 배치 */}
          <section className="mb-12 flex justify-center">
            <button
              className={`text-2xl px-4 py-2 rounded-lg shadow-md border border-gray-300 flex items-center space-x-2 ${liked ? "text-red-500 bg-gray-100" : "text-gray-400 bg-white"}`}
              onClick={handleLike}
            >
              ❤️ 좋아요 {likes}
            </button>
          </section>

          {/* 댓글 입력 및 목록 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글</h2>
            <div className="flex items-center space-x-2">
              <textarea
                className="w-full border-gray-300 rounded-lg p-2"
                placeholder="댓글을 입력하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleCommentSubmit}
              >
                댓글 작성
              </button>
            </div>
            {/* 댓글 목록 */}
            <div className="mt-6 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border p-4 rounded-lg">
                  <p className="text-gray-700">{comment.text}</p>
                  <button
                    className="text-sm text-blue-500 mt-2"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    답글 달기
                  </button>

                  {/* 대댓글 입력창 */}
                  {replyingTo === comment.id && (
                    <div className="mt-2">
                      <textarea
                        className="w-full border-gray-300 rounded-lg p-2"
                        placeholder="대댓글을 입력하세요..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                      />
                      <button
                        className="mt-2 bg-blue-400 text-white px-3 py-1 rounded-md"
                        onClick={() => handleReplySubmit(comment.id)}
                      >
                        답글 작성
                      </button>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  <div className="mt-3 space-y-2">
                    {comment.replies?.map((reply) => (
                      <div key={reply.id} className="ml-6 border-l pl-4">
                        <p className="text-gray-600">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default TripReview;
