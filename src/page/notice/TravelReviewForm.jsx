import React, { useEffect } from "react";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import Select from 'react-select';
import { DndContext, closestCorners, pointerWithin, useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";
import useBoard from "../../components/hooks/useBoard";

// 개별 이미지 드래그 가능하도록 설정
const DraggableImage = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} data-id={item.id}  // ID를 HTML 속성으로 추가 
      {...attributes} {...listeners} className="relative cursor-move">
      <img src={item.url} alt="업로드된 이미지" className="w-full h-32 object-cover rounded-lg shadow-md" />
    </div>
  );
};

// 🗑 휴지통 컴포넌트
const TrashBin = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash-bin",
  });

  useEffect(() => {
    console.log("🗑 isOver 값:", isOver); // 콘솔로 값 확인
  }, [isOver]);

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-20 flex justify-center items-center gap-2 border-2 rounded-lg mt-4 
  ${isOver ? "bg-rose-500 text-white border-red-700" : "bg-gray-100 text-gray-600 border-gray-300"}`}
    >
      <i className="fa-solid fa-trash text-2xl"></i>
      <span className="fa-solid text-lg font-medium">휴지통</span>
    </div>
  );
};

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
    maskUserId,
    handleSortEnd,
    handleDrop,
    handleDropToDelete
  } = useBoard(false); // false = 작성 모드(수정모드X)


  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: true,
    onDrop: handleDrop
  });

  useEffect(() => {
    if (photoUrls.length > 0) {
      const updatedPreviewUrls = photoUrls.map((url, index) => ({
        id: index,
        url: url,
      }));
      setPreviewUrls(updatedPreviewUrls);
    }
  }, [photoUrls]);

  useEffect(() => {
    console.log("🖼 업데이트된 files 상태:", files);
    console.log("🖼 업데이트된 previewUrls 상태:", previewUrls);
    console.log("🖼 업데이트된 photoUrls 상태:", photoUrls);
  }, [files, previewUrls, photoUrls]);


  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h1 className="text-lg font-medium leading-6 text-gray-900 select-none">여행 후기 작성</h1>
        <div className="flex items-center mb-3">
          <span className="text-red-500 text-[10px] ml-2 fa-solid fa-star-of-life"></span>
          <label className="text-[11px] text-red-500 ml-1" >표기 항목은 반드시 작성해주세요.</label>
        </div>

        <div className="space-y-6 select-none">
          <div>
            <div className="flex items-center ">
              <label className="block text-sm font-medium text-gray-700 select-none ">제목</label>
              <label className="block text-[10px] font-medium text-gray-700 select-none ">(20자 이내)</label>
              <span className="text-red-500 text-[10px] ml-2 fa-solid fa-star-of-life"></span>
            </div>
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
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 select-none">여행지</label>
                <span className="text-red-500 text-[10px] ml-2 fa-solid fa-star-of-life"></span>
              </div>
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
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 select-none">여행 기간</label>
                <span className="text-red-500 text-[10px] ml-2 fa-solid fa-star-of-life"></span>
              </div>
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
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 select-none">만족도</label>
            <span className="text-red-500 text-[10px] ml-2 fa-solid fa-star-of-life"></span>
          </div>
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

        {/* 📂 파일 업로드 영역 */}
        <div className="mt-4 select-none">
          <label className="block text-sm font-medium text-gray-700 select-none">사진 첨부</label>
          <div {...getRootProps()} className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer">
            <input {...getInputProps()} />

            {previewUrls.length > 0 ? (
              <DndContext
                collisionDetection={pointerWithin}
                onDragEnd={({ active, over }) => {
                  if (over?.id === "trash-bin") {
                    console.log("🗑 휴지통으로 드래그됨", active.id);
                    handleDropToDelete({ active, over });
                  } else if (over?.id) {
                    handleSortEnd(active.id, over.id);
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  {/* 정렬 가능한 이미지 리스트 */}
                  <SortableContext items={previewUrls.map((item) => item.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 gap-2 w-full h-32">
                      {previewUrls.map((item) => (
                        <DraggableImage key={item.id} item={item} />
                      ))}
                    </div>
                  </SortableContext>

                  {/* 🗑 휴지통을 업로드 영역 아래 배치 */}
                  <TrashBin />
                </div>
              </DndContext>
            ) : (
              <div className="space-y-2">
                <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-3"></i>
                <p className="text-sm text-gray-600">사진을 업로드하려면 클릭하세요</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
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
            className="bg-custom bg-sky-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </div>
      </div>
    </main >
  );
};

export default TravelReviewForm;
