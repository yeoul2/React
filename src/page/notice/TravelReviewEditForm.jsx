import React, { useEffect} from "react";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import Select from 'react-select';
import useBoard from "../../components/hooks/useBoard";

const TravelReviewForm = () => {
  const {
    navigate,
    customStyles,
    datePickerRef,
    flatpickrInstance,
    isDatePickerOpen,
    setIsDatePickerOpen,
    dateRange,
    setDateRange,
    title,
    setTitle,
    country,
    setCountry,
    city,
    setCity,
    actualSchedule,
    setActualSchedule,
    satisfaction,
    setSatisfaction,
    review,
    setReview,
    files,
    setFiles,
    previewUrls,
    setPreviewUrls,
    photoUrls,
    setPhotoUrls,
    visibility,
    setVisibility,
    handleImageUpload,
    handleSubmit,
    toggleDatePicker,
    options,
    aiSchedule,
    setAiSchedule,
    handleFileUpload,
    addPlace,
    addSchedule,
    removeSchedule,
    handleRemoveFile,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    maskUserId
  } = useBoard(true); // true = 수정 모드
  console.log(departureDate);
  console.log(returnDate);

  useEffect(() => {
    setPreviewUrls(photoUrls.filter(url => url));
  }, [photoUrls]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h1 className="text-lg font-medium leading-6 text-gray-900 mb-4 select-none">여행 후기 수정</h1>

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
                placeholder={`${departureDate} ~ ${returnDate}`}
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
              <div className="border border-gray-200 rounded-lg p-4 ">
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">실제 일정</span>
                </div >
                <div className="space-y-4">
                  {actualSchedule.map((schedule, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-4 ml-2 relative ">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Day가 변경되지 않으면 한번만 표시 */}
                        {index === 0 || actualSchedule[index].day !== actualSchedule[index - 1].day ? (
                          <span className="bg-green-50 text-green-700 px-2 py-[2px]  rounded-full text-sm inline-flex items-center whitespace-nowrap w-fit">
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
                          placeholder="시간(HH:MM:SS) "
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
          <label className="block text-sm font-medium text-gray-700 select-none">사진 첨부</label>
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
            수정하기
          </button>
        </div>
      </div>
    </main>
  );
};

export default TravelReviewForm;
