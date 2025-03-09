import { useState } from "react";

const TripReview = () => {
  const [comments, setComments] = useState([
    { id: 1, author: "travel_lover", date: "2024.02.15", text: "정말 좋은 여행 후기네요! 저도 곧 파리 여행을 가는데 많은 도움이 되었습니다. 혹시 숙소는 어디에 머무셨나요?" }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const newCommentObj = {
        id: comments.length + 1,
        author: "새 댓글 작성자",
        date: new Date().toLocaleDateString("ko-KR"),
        text: newComment,
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">파리 7일간의 로맨틱 여행</h1>
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-8">
          <span className="text-gray-500">traveler123</span>
          <span>2024.02.15</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">여행지</h3>
            <p className="text-gray-600">프랑스 파리</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">여행 기간</h3>
            <p className="text-gray-600">2024.01.15 - 2024.01.21</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">여행 후기</h2>
        <p className="text-gray-700">
          파리는 정말 로맨틱한 도시였습니다. 에펠탑의 야경은 사진으로 보는 것보다 훨씬 아름다웠고,
          루브르 박물관의 작품들은 감동 그 자체였습니다. 베르사유 궁전의 웅장함도 인상적이었습니다.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-6">댓글</h2>
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-t pt-6">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-gray-500 ml-2">{comment.date}</span>
              </div>
              <p className="mt-1 text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start space-x-3 mt-6">
          <textarea
            className="flex-grow border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleAddComment}
          >
            댓글 작성
          </button>
        </div>
      </article>
    </main>
  );
};

export default TripReview;
