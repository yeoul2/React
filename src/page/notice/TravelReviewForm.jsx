import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import Select from 'react-select';
import useStyle from "../../components/hooks/useStyle";

const TravelReviewForm = () => {
  const customStyles = useStyle();
  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null); // 📌 Flatpickr 인스턴스 저장
  const [dateRange, setDateRange] = useState([]); // 날짜 선택
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 📌 달력 토글 상태
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [satisfaction, setSatisfaction] = useState(0);
  const [review, setReview] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]); // 이미지 미리보기 URL 저장
  const [visibility, setVisibility] = useState("Y");
  const navigate = useNavigate();

  // 공개 옵션값 변수 설정
  const options = [
    { value: "Y", label: "전체공개" },
    { value: "N", label: "내꺼" },
  ];
  // 📌 Flatpickr 초기화 및 관리
  useEffect(() => {
    if (datePickerRef.current) {
      if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 기존 인스턴스 제거

      flatpickrInstance.current = flatpickr(datePickerRef.current, {
        locale: "ko",
        mode: "range",
        dateFormat: "Y.m.d",
        minDate: "today",
        disableMobile: true,
        onChange: (selectedDates) => {
          setDateRange(selectedDates);
          if (selectedDates.length === 2) {
            const nights = Math.round((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24));
            //setTripDuration(`${nights}박 ${nights + 1}일`);
            console.log(selectedDates[0], selectedDates[1]);
          }
          setIsDatePickerOpen(false); // 📌 날짜 선택 시 달력 닫기
        },
        onClose: () => setIsDatePickerOpen(false), // 📌 빈 곳 클릭 시 달력 닫기
      });
    }
    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy(); // 언마운트 시 인스턴스 제거
      }
    };
  }, []);
  // 📌 달력 토글 기능
  const toggleDatePicker = () => {
    if (flatpickrInstance.current) {
      if (isDatePickerOpen) {
        flatpickrInstance.current.close(); // 📌 달력이 열려 있으면 닫기
      } else {
        flatpickrInstance.current.open(); // 📌 달력이 닫혀 있으면 열기
      }
      setIsDatePickerOpen(!isDatePickerOpen); // 📌 상태 업데이트
    }

  };
  // 달력 날짜 포맷 변환
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 1월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // AI 추천 일정 상태
  const [aiSchedule, setAiSchedule] = useState([
    { day: "Day 1", place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
  ]);

  // 실제 일정 상태
  const [actualSchedule, setActualSchedule] = useState([
    { day: 1, place: "", time: "", details: "" },
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

  // 장소 추가
  const addPlace = (index) => {
    // 해당 인덱스의 Day에만 장소 추가
    const newSchedule = [...actualSchedule];
    // 새로운 장소 객체 생성
    const newPlace = {
      day: actualSchedule[index].day, // 기존 index의 day 값을 유지
      place: "",
      time: "",
      details: "",
    };
    // index 다음 위치에 새로운 데이터 삽입
    newSchedule.splice(index + 1, 0, newPlace);
    setActualSchedule(newSchedule);
  }
  // 일정 추가 (AI 일정과 실제 일정 함께 추가)
  const addSchedule = () => {
    const newDay = actualSchedule[actualSchedule.length - 1].day + 1;

    /*     setAiSchedule([
          ...aiSchedule,
          { day: newDay, place: "AI 추천 장소", time: "AI 추천 시간", details: "AI 추천 상세 내용" },
        ]); */

    setActualSchedule([
      ...actualSchedule,
      { day: newDay, place: "", time: "", details: "" },
    ]);
  };

  // 일정 삭제 (AI 일정과 실제 일정 함께 삭제 & Day 번호 재정렬)
  const removeSchedule = (index) => {
    if (actualSchedule.length > 1) {
      //const updatedAiSchedule = aiSchedule.filter((_, i) => i !== index);
      //const updatedActualSchedule = actualSchedule.filter((_, i) => i !== index);
      const updatedActualSchedule = [...actualSchedule]; // 기존 배열 복사
      updatedActualSchedule.splice(index, 1); // index 위치의 요소 1개 제거

      /*       // Day 번호를 다시 1부터 재정렬
            const newAiSchedule = updatedAiSchedule.map((item, idx) => ({
              ...item,
              day: `Day ${idx + 1}`
            }));
       */
      /*       const newActualSchedule = updatedActualSchedule.map((item, idx) => ({
              ...item,
              day: `Day ${idx + 1}`
            })); */

      //setAiSchedule(newAiSchedule);
      setActualSchedule(updatedActualSchedule);
    } else {
      alert("최소 한 개의 일정은 유지해야 합니다.");
    }
  };
  // 제출 핸들러
  const handleSubmit = () => {
    const formData = {
      title,
      country,
      city,
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
        <h1 className="text-lg font-medium leading-6 text-gray-900 mb-4 select-none">여행 후기 작성</h1>

        <div className="space-y-6 select-none">
          <div>
            <label className="block text-sm font-medium text-gray-700 select-none ">제목</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 select-none">여행지</label>
              <div className="flex grid-cols-1 sm:grid-cols-2 select-none">
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none"
                  placeholder="나라"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none"
                  placeholder="도시"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 select-none">여행 기간</label>
              <input
                ref={datePickerRef}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none cursor-pointer"
                placeholder="여행 날짜를 선택하세요"
                onClick={toggleDatePicker} // 📌 클릭 시 달력 토글
                readOnly // 📌 키보드 입력 방지 (달력으로만 선택)
              />
            </div>
          </div>

          {/* 일정 비교 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 select-none">일정 타임라인 비교</label>
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
                </div >
                <div className="space-y-4">
                  {actualSchedule.map((schedule, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4 ml-2 relative">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Day가 변경되지 않으면 한번만 표시 */}
                        {index === 0 || actualSchedule[index].day !== actualSchedule[index - 1].day ? (
                          <span className="bg-green-50 text-green-700 px-2 py-1 mr-[53px] rounded-full text-sm inline-block">
                            {`DAY ${schedule.day}`}</span>
                        ) : <span className="px-2 py-1 mt-3 rounded text-sm"></span>}
                      </div>
                      <div>
                        {/* 장소 추가 버튼 */}
                        <button
                          className="absolute top-0 right-5  text-gray-500 text-xl rounded-full p-1 mr-2 fa-solid fa-calendar-plus"
                          onClick={() => addPlace(index)}
                        >
                        </button>
                        {/* 일정 삭제 버튼 */}
                        <button
                          className="absolute top-0 right-0 text-gray-500 text-xl rounded-full p-1 fa-solid fa-calendar-minus"
                          onClick={() => removeSchedule(index)}
                        >
                        </button>
                      </div>
                      {/* 일정 내용 */}
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

                  {/* 일정 추가 버튼 */}
                  <button
                    className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-gray-500 hover:border-green-500 hover:text-green-500"
                    onClick={addSchedule}
                  >
                    + DAY 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 만족도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 select-none">만족도</label>
          <div className="mt-2 flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                className={`text-2xl cursor-pointer hover:opacity-80 select-none`}
                onClick={() => setSatisfaction(num)}>
                <img src={`${satisfaction >= num ? "/images/ui_image/like3.png" : "/images/ui_image/unlike3.png"} `}
                  alt="" className="w-[70px] h-[70px]" />
              </span>
            ))}
          </div>
        </div>

        {/* 여행 후기 입력 */}
        <div className="mt-4 select-none">
          <label className="block text-sm font-medium text-gray-700 select-none">여행 후기</label>
          <textarea
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-0 focus:outline-none"
            rows="4"
            placeholder="전반적인 여행 후기를 작성해주세요"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>
        </div>

        {/* 파일 업로드 */}
        <div className="mt-4 select-none">
          <label className="block text-sm font-medium text-gray-700 select-none">사진 및 동영상 첨부</label>
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
          {/* mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none */}
          {/* onChange={(e) => setVisibility(e.target.value)} */}
          <Select
            className=""
            styles={customStyles}
            value={options.find(option => option.value === visibility)}
            options={options}
            onChange={(e) => setVisibility(e.value)}
          />
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
