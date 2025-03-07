import React, { useState } from "react";

const TravelReviewForm = () => {
  // 입력 상태 관리
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState("전체 공개");

  // 일정 추가 함수
  const addTimeline = () => {
    setTimeline([...timeline, { date: "", place: "", time: "", details: "" }]);
  };

  // 일정 삭제 함수
  const removeTimeline = (index) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  // 일정 변경 핸들러
  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = [...timeline];
    updatedTimeline[index][field] = value;
    setTimeline(updatedTimeline);
  };

  // 파일 업로드 핸들러
  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  // 폼 제출 핸들러
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      title,
      destination,
      travelDate,
      timeline,
      rating,
      review,
      files,
      visibility,
    };
    console.log("폼 데이터:", formData);
    alert("여행 후기가 제출되었습니다!");
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            여행 후기 작성
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                제목
              </label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 여행지 & 여행 기간 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  여행지
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                  placeholder="여행지를 입력하세요"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  여행 기간
                </label>
                  <input
                    type="date"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  />
              </div>
            </div>

            {/* 일정 타임라인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                일정 타임라인
              </label>
              <div className="mt-2 space-y-4">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      onClick={() => removeTimeline(index)}
                    >
                      ×
                    </button>
                      <input
                        type="date"
                      className="border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                        value={item.date}
                      onChange={(e) =>
                        handleTimelineChange(index, "date", e.target.value)
                      }
                      />
                      <input
                        type="text"
                      className="border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom mt-2"
                        placeholder="장소"
                        value={item.place}
                      onChange={(e) =>
                        handleTimelineChange(index, "place", e.target.value)
                      }
                      />
                      <input
                        type="text"
                      className="border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom mt-2"
                        placeholder="시간"
                        value={item.time}
                      onChange={(e) =>
                        handleTimelineChange(index, "time", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-gray-500 hover:border-custom hover:text-custom"
                  onClick={addTimeline}
                >
                  + 일정 추가
                </button>
              </div>
            </div>

            {/* 여행 후기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                여행 후기
              </label>
              <textarea
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                rows="4"
                placeholder="전반적인 여행 후기를 작성해주세요"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            {/* 사진 및 동영상 첨부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                사진 및 동영상 첨부
              </label>
              <input type="file" multiple onChange={handleFileChange} />
            </div>

            {/* 공개 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                공개 설정
              </label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-custom focus:border-custom"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option>전체 공개</option>
                <option>내꺼</option>
              </select>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                className="bg-custom text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default TravelReviewForm;
