import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // API 요청을 위한 axios 추가

const TravelReviewForm = () => {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [satisfaction, setSatisfaction] = useState(0);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]); // 이미지 미리보기 URL 저장
  const [visibility, setVisibility] = useState("전체 공개");
  const navigate = useNavigate();

  // AI 추천 일정 상태
  const [aiSchedule, setAiSchedule] = useState([
    { day: "Day 1", place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
  ]);

  // 실제 일정 상태
  const [actualSchedule, setActualSchedule] = useState([
    { day: "Day 1", place: "", time: "", details: "" },
  ]);

  // 파일 업로드 핸들러
  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles([...files, ...selectedFiles]);

    // 업로드된 파일을 URL로 변환하여 미리보기 생성
    const newPreviewUrls = selectedFiles.map((file) => {
      return URL.createObjectURL(file);
    });

    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  // 파일 삭제 핸들러
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  // 일정 추가 (AI 일정과 실제 일정 함께 추가)
  const addSchedule = () => {
    const newDay = `Day ${actualSchedule.length + 1}`;

    setAiSchedule([
      ...aiSchedule,
      { day: newDay, place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
    ]);

    setActualSchedule([
      ...actualSchedule,
      { day: newDay, place: "", time: "", details: "" },
    ]);
  };

  // 일정 삭제 (AI 일정과 실제 일정 함께 삭제 & Day 번호 재정렬)
  const removeSchedule = (index) => {
    if (actualSchedule.length > 1) {
      const updatedAiSchedule = aiSchedule.filter((_, i) => i !== index);
      const updatedActualSchedule = actualSchedule.filter((_, i) => i !== index);

      // Day 번호를 다시 1부터 재정렬
      const newAiSchedule = updatedAiSchedule.map((item, idx) => ({
        ...item,
        day: `Day ${idx + 1}`
      }));

      const newActualSchedule = updatedActualSchedule.map((item, idx) => ({
        ...item,
        day: `Day ${idx + 1}`
      }));

      setAiSchedule(newAiSchedule);
      setActualSchedule(newActualSchedule);
    } else {
      alert("최소 한 개의 일정은 유지해야 합니다.");
    }
  };

  // 제출 핸들러
  const handleSubmit = () => {
    const formData = {
      title,
      destination,
      travelDate,
      satisfaction,
      review,
      files,
      visibility,
    };
    console.log("등록된 데이터:", formData);
    alert("글이 등록되었습니다.");
    navigate("/board");
  };

  /*
    // **백엔드 API로 데이터 저장하는 함수**
    const handleSubmit = async () => {
      if (!title || !destination || !review) {
        alert("제목, 여행지, 후기를 입력해주세요.");
        return;
      }
  
      const formData = new FormData(); // 파일 업로드를 위한 FormData 사용
      formData.append("title", title);
      formData.append("destination", destination);
      formData.append("travelDate", travelDate);
      formData.append("satisfaction", satisfaction);
      formData.append("review", review);
      formData.append("visibility", visibility);
  
      // 일정 데이터 JSON 변환 후 추가
      formData.append("aiSchedule", JSON.stringify(aiSchedule));
      formData.append("actualSchedule", JSON.stringify(actualSchedule));
  
      // 파일 추가
      files.forEach((file) => {
        formData.append("files", file);
      });
  
      try {
        // **백엔드 API에 POST 요청**
        const response = await axios.post("http://localhost:7007/api/travel-review", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // 파일 업로드를 위한 설정
          },
        });
  
        if (response.status === 200) {
          alert("글이 성공적으로 등록되었습니다.");
          
          // **게시판 목록 페이지로 이동**
          navigate("/board");
        }
      } catch (error) {
        console.error("등록 오류:", error);
        alert("글 등록 중 오류가 발생했습니다.");
      }
    };
     */

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

          {/* 일정 비교 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">일정 타임라인 비교</label>
            <div className="grid grid-cols-2 gap-4">

              {/* AI 추천 일정 */}
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

              {/* 실제 일정 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">실제 일정</span>
                </div>
                <div className="space-y-4">
                  {actualSchedule.map((schedule, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4 ml-2 relative">
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

                      {/* 일정 삭제 버튼 */}
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                        onClick={() => removeSchedule(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* 일정 삭제 버튼 */}
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
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative">
            <input
              type="file"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
            />

            {/* 업로드된 이미지 미리보기 */}
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 w-full">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`업로드된 이미지 ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      onClick={() => handleRemoveFile(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                <p className="text-sm text-gray-600">파일을 업로드하려면 클릭하세요</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
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
