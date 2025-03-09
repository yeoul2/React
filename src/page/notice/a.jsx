import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TravelReviewForm = () => {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [satisfaction, setSatisfaction] = useState(0);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState("전체 공개");
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  const [aiSchedule] = useState([
    { day: "Day 1", place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
    { day: "Day 2", place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
  ]);

  const [actualSchedule, setActualSchedule] = useState([
    { day: "Day 1", place: "", time: "", details: "" },
    { day: "Day 2", place: "", time: "", details: "" },
  ]);

  const handleFileUpload = (event) => {
    setFiles([...event.target.files]);
  };

  const addSchedule = () => {
    setActualSchedule([
      ...actualSchedule,
      { day: `Day ${actualSchedule.length + 1}`, place: "", time: "", details: "" },
    ]);
  };

  const handleSubmit = () => {
    const formData = {
      satisfaction,
      review,
      files,
      visibility,
    };
    console.log("등록된 데이터:", formData);
    alert("글이 등록되었습니다.");
  };

  return (
    <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h1 className="text-lg font-medium leading-6 text-gray-900 mb-4">여행 후기 작성</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">여행지</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
                placeholder="여행지를 입력하세요"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">여행 기간</label>
              <input
                type="date"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">일정 타임라인 비교</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">AI 추천 일정</span>
                </div>
                <div className="space-y-4">
                  {aiSchedule.map((schedule, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 ml-2">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">{schedule.day}</span>
                      <div className="mt-2 space-y-2">
                        <input type="text" className="w-full border-gray-300 rounded-lg" placeholder="장소" value={schedule.place} disabled />
                        <input type="text" className="w-full border-gray-300 rounded-lg" placeholder="시간" value={schedule.time} disabled />
                        <textarea className="w-full border-gray-300 rounded-lg" rows="2" placeholder="상세 내용" value={schedule.details} disabled></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">실제 일정</span>
                </div>
                <div className="space-y-4">
                  {actualSchedule.map((schedule, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4 ml-2">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm">{schedule.day}</span>
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-lg"
                          placeholder="장소"
                          value={schedule.place}
                          onChange={(e) => {
                            const newSchedule = [...actualSchedule];
                            newSchedule[index].place = e.target.value;
                            setActualSchedule(newSchedule);
                          }}
                        />
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-lg"
                          placeholder="시간"
                          value={schedule.time}
                          onChange={(e) => {
                            const newSchedule = [...actualSchedule];
                            newSchedule[index].time = e.target.value;
                            setActualSchedule(newSchedule);
                          }}
                        />
                        <textarea
                          className="w-full border-gray-300 rounded-lg"
                          rows="2"
                          placeholder="상세 내용"
                          value={schedule.details}
                          onChange={(e) => {
                            const newSchedule = [...actualSchedule];
                            newSchedule[index].details = e.target.value;
                            setActualSchedule(newSchedule);
                          }}
                        ></textarea>
                      </div>
                    </div>
                  ))}
                  <button
                    className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-gray-500 hover:border-green-500 hover:text-green-500"
                    onClick={addSchedule}
                  >
                    + 일정 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 만족도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">만족도</label>
          <div className="mt-2 flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`text-2xl cursor-pointer ${satisfaction >= num ? "opacity-100" : "opacity-50"
                  } hover:opacity-80`}
                onClick={() => setSatisfaction(num)}
              >
                🍊
              </span>
            ))}
          </div>
        </div>

        {/* 여행 후기 입력 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">여행 후기</label>
          <textarea
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
            rows="4"
            placeholder="전반적인 여행 후기를 작성해주세요"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>
        </div>

        {/* 파일 업로드 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">사진 및 동영상 첨부</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-lg font-medium text-custom hover:text-custom-dark focus-within:outline-none">
                  <span>파일 업로드</span>
                  <input type="file" className="sr-only" multiple onChange={handleFileUpload} />
                </label>
              </div>
              <button
                className="mt-2 bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium"
                onClick={() => document.querySelector("input[type=file]").click()}
              >
                파일 선택하기
              </button>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {files.map((file, index) => (
                <p key={index}>{file.name}</p>
              ))}
            </div>
          )}
        </div>

        {/* 공개 설정 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">공개 설정</label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-custom focus:border-custom"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option>전체 공개</option>
            <option>내꺼</option>
          </select>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button
            type="submit"
            className="bg-custom text-white rounded-lg px-4 py-2 text-sm font-medium"
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </div>
      </div>
    </main>
  );
};

export default TravelReviewForm;
