import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import "flatpickr/dist/l10n/ko.js";
import { arrayMove } from "@dnd-kit/sortable";
import useStyle from "../../components/hooks/useStyle";
import {
   insertBoard,
   updateBoard,
   uploadImages,
} from "../../services/boardApi";
import { getCourseByUserId, getCourseDetail } from "../../services/courseLogic";
import { set } from "react-hook-form";

const useBoard = (isEditMode = false) => {
   const navigate = useNavigate();
   const { tb_no } = useParams();
   const location = useLocation();
   const { customStyles } = useStyle();
   const datePickerRef = useRef(null);
   const flatpickrInstance = useRef(null);
   const [courseno, setCourseno] = useState(0);

   const [courseModal, setCourseModal] = useState(false);
   const [courses, setCourses] = useState([]);

   const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
   const [dateRange, setDateRange] = useState([]);
   const [title, setTitle] = useState("");
   const [country, setCountry] = useState("");
   const [city, setCity] = useState("");
   const [satisfaction, setSatisfaction] = useState(0);
   const [review, setReview] = useState("");
   const [visibility, setVisibility] = useState("Y");
   const [files, setFiles] = useState([]);
   const [previewUrls, setPreviewUrls] = useState([]);
   const [photoUrls, setPhotoUrls] = useState([]);
   // 실제 일정 상태
   const [actualSchedule, setActualSchedule] = useState([
      { day: 1, place: "", types:"", time: "", details: "" },
   ]);
   // 공개설정 옵션값 설정
   const options = [
      { value: "Y", label: "전체공개" },
      { value: "N", label: "내꺼" },
   ];

   useEffect(() => {
      // 수정일 경우 state에서 데이터 가져와서 변수에 담기
      if (isEditMode && location.state) {
         const { tripData, tripdetailData } = location.state;
         console.log(tripData);
         console.log(tripdetailData);
         setTitle(tripData?.tb_title || "");
         setCountry(tripData?.tb_country || "");
         setCity(tripData?.tb_city || "");
         setReview(tripData?.tb_review || "");
         setSatisfaction(tripData?.tb_star || 0);
         setDateRange([tripData?.tb_departure_date, tripData?.tb_return_date]);
         const photoList =
            tripData && typeof tripData === "object"
               ? [
                  tripData.tb_photo1 || null,
                  tripData.tb_photo2 || null,
                  tripData.tb_photo3 || null,
               ].filter(Boolean)
               : [];
         const dburls = photoList.map((url, index) => ({
            id: index,
            url: url,
         }));
         setPreviewUrls(dburls);
         setPhotoUrls(photoList);
         setFiles(photoList);
         setActualSchedule(
            Array.isArray(tripdetailData)
               ? tripdetailData.map(
                  ({ tbd_day, tbd_place, tbd_time, tbd_content }) => ({
                     day: tbd_day,
                     place: tbd_place,
                     time: tbd_time,
                     details: tbd_content,
                  })
               )
               : []
         );
         setVisibility(tripData?.tb_public || "Y");
         setCourseno(tripData?.cs_no || 0); // 수정할때 DB에서 게시글이 무슨 cs_no 참고하는지 끌고와서 상태 저장
      }
   }, [isEditMode, location.state]);

   // 📆Flatpickr 초기화 및 관리
   useEffect(() => {
      if (datePickerRef.current) {
         if (flatpickrInstance.current) flatpickrInstance.current.destroy(); // 기존 인스턴스 제거

         flatpickrInstance.current = flatpickr(datePickerRef.current, {
            locale: "ko",
            mode: "range",
            dateFormat: "Y-m-d",
            disableMobile: true,
            onChange: (selectedDates) => {
               setDateRange(
                  formatDate(selectedDates[0]),
                  formatDate(selectedDates[1])
               );
               if (selectedDates.length === 2) {
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

   // 📆 달력 토글 기능
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

   // 📆 달력 날짜 포맷 변환
   const formatDate = (date) => {
      if (!date) return "";
      else {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, "0"); // 1월은 0부터 시작하므로 +1
         const day = String(date.getDate()).padStart(2, "0");
         return `${year}-${month}-${day}`;
      }
   };
   // AI 추천 일정 상태
   const [aiSchedule, setAiSchedule] = useState([
      {
         day: 1,
         place: "AI 추천 장소",
         time: "AI 추천 시간",
         details: "AI 추천 상세 내용",
      },
   ]);

   // ⏰📝 `오전/오후`가 포함된 시간을 변환하는 함수
   const convertTo24HourFormat = (timeString) => {
      if (!timeString) return "00:00:00";
      const [period, time] = timeString.split(" "); // "오전 03:00:00" -> ["오전전","03:00:00"]
      let [hours, minutes, seconds] = time.split(":").map(Number);

      if (period === "오전" && hours !== 12) {
         hours += 12; // 오전이면서 12시가 아닐 경우 12 더함
      } else if (period === "오후" && hours === 12) {
         hours = 0; // 오후이면서 12시는 00시로 변환
      }

      // 두 자리수 형식으로 변환
      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
   };

   // 코스 조회하기 버튼 클릭시
   const handleOpenCsModal = () => {
      setCourseModal(true);
      console.log("🔍 코스 조회하기 버튼 클릭");
   };

   // user_id 로 코스 조회하기
   useEffect(() => {
      const fetchCourses = async () => {
         try {
            const user_id = localStorage.getItem("user_id");
            const courseData = await getCourseByUserId(user_id); // API 호출
            setCourses(courseData); // 상태 업데이트
         } catch (error) {
            console.error("코스 데이터를 불러오는 중 오류 발생:", error);
         }
      };

      fetchCourses();
   }, []); // 마운트 시 한 번 실행

   // 코스num 바뀌면 실행(코스 불러와서 적용)
   useEffect(() => {
      console.log("🔍 코스번호:", courseno);
      if (courseno !== 0) {
         const fetchCourseDetail = async () => {
            try {
               const courseDetailData = await getCourseDetail(courseno); // API 호출
               const course = courseDetailData[0];
               console.log("🔍 코스 데이터:", course);
               setTitle(course.cs_name);
               setCountry(course.cs_country);
               setCity(course.cs_city);
               setDateRange([course.cs_departure_date, course.cs_return_date]);
               const coursedetails = courseDetailData[1].details;
               console.log("🔍 코스 상세 데이터:", coursedetails);
               setAiSchedule(
                  Array.isArray(coursedetails)
                     ? coursedetails.map(
                        ({ cdt_day, cdt_place, cdt_time }) => ({
                           day: cdt_day,
                           place: cdt_place,
                           time: cdt_time,
                           // details: element.cdt_content > 📝테이블에 존재하지 않음
                        })
                     )
                     : []
               );
            } catch (error) {
               console.error(
                  "코스 상세 데이터를 불러오는 중 오류 발생:",
                  error
               );
            }
         };
         fetchCourseDetail();
      }
   }, [courseno]);

   // 📝장소 추가 (같은 Day에 장소,내용만 추가)
   const addPlace = (index) => {
      // 해당 인덱스의 Day에만 장소 추가
      const newSchedule = [...actualSchedule];
      // 새로운 장소 객체 생성
      const newPlace = {
         day: actualSchedule[index].day, // 기존 index의 day 값을 유지
         place: "",
         types:"",
         time: "",
         details: "",
      };
      // index 다음 위치에 새로운 데이터 삽입
      newSchedule.splice(index + 1, 0, newPlace);
      setActualSchedule(newSchedule);
   };

   // 📝일정 추가 (Day추가)
   const addSchedule = () => {
      const newDay = actualSchedule[actualSchedule.length - 1].day + 1;
      setActualSchedule([
         ...actualSchedule,
         { day: newDay, place: "", types:"", time: "", details: "" },
      ]);
   };

   // 📝일정 삭제 (실제 일정 삭제 & Day 번호 재정렬)
   const removeSchedule = (index) => {
      if (actualSchedule.length > 1) {
         // 데이터가 1개 일때는 삭제 메소드 실행 x
         const updatedActualSchedule = [...actualSchedule];
         const removedItem = updatedActualSchedule.splice(index, 1); // 선택한 일정 삭제
         const hasRemainingDays = (schedule, deletedDay) => {
            // 1️⃣ 삭제 후 동일한 Day가 남아있는지 확인
            const remainingDays = new Map();
            schedule.forEach((item) => {
               remainingDays.set(
                  item.day,
                  (remainingDays.get(item.day) || 0) + 1
               );
            });
            // 2️⃣ 동일한 Day가 남아있으면 true, 없으면 false 반환
            return remainingDays.get(deletedDay) > 0;
         };
         const hasRemainDay = hasRemainingDays(
            updatedActualSchedule,
            removedItem[0].day
         );
         if (!hasRemainDay) {
            // 3️⃣ 동일한 Day가 남아있지 않으면, 그 Day보다큰 Day는 -1을 해서 재정렬
            updatedActualSchedule.forEach((item) => {
               if (item.day > removedItem[0].day) {
                  item.day -= 1;
               }
            });
         }
         setActualSchedule(updatedActualSchedule);
      } else {
         alert("최소 한 개의 일정은 유지해야 합니다.");
      }
   };

   // 📷 파일 업로드 처리 (react-dropzone)
   const handleDrop = async (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file, index) => ({
         id: `${previewUrls.length + index}`,
         url: URL.createObjectURL(file), // 미리보기 URL 생성
         file,
      }));
      // 현재 업로드된 파일 개수와 새로운 파일 개수 합산하여 3장을 초과하는지 확인
      if (files.length + newFiles.length > 3) {
         alert("사진은 최대 3장만 넣을 수 있습니다.");
         return; // 🚫 추가하지 않고 함수 종료
      }

      // 클라우디너리에 업로드 후 URL 저장
      const uploadedUrls = await uploadImages(
         newFiles.map((item) => item.file)
      );
      setFiles((prev) => [...prev, ...newFiles.map((item) => item.file)]);
      setPreviewUrls((prev) => [...prev, ...newFiles]);
      setPhotoUrls((prev) => [...prev, ...uploadedUrls]);
   };

   // 📷파일 드래그 삭제 (drop)
   const handleDropToDelete = ({ active, over }) => {
      if (over?.id === "trash-bin") {
         console.log("🗑 삭제할 이미지 index:", active.id);
         handleRemoveFile(active.id);
      }
   };

   // 📷파일 삭제 핸들러
   const handleRemoveFile = (id) => {
      console.log(`✅ handleRemoveFile 실행 완료, 삭제할 id: ${id}`);
      console.log(`📷 현재 파일 상태:`, files);
      console.log(`🖼 현재 미리보기 상태:`, previewUrls);
      console.log(`🔗 현재 사진 URL 상태:`, photoUrls);

      const filteredFiles = files.filter(
         (item, index) => item.id !== id && index !== id
      );
      console.log(filteredFiles);
      const updatedFiles = filteredFiles.map((url, index) => ({
         id: index,
         url: url, // ✅ 문자열을 객체의 url 속성으로 변환
      }));
      console.log(updatedFiles);
      setFiles(updatedFiles);

      const filteredPreviewUrls = previewUrls.filter((item) => item.id !== id);
      console.log(filteredPreviewUrls);
      const updatedPreviewUrls = filteredPreviewUrls.map((item, index) => ({
         ...item,
         id: index,
      }));
      console.log(updatedPreviewUrls);
      setPreviewUrls(updatedPreviewUrls);

      const updatedPhotoUrls = photoUrls.filter(
         (item, index) => index !== Number(id)
      );
      console.log(updatedPhotoUrls);
      setPhotoUrls(updatedPhotoUrls);
   };

   // 📷이미지 업로드 핸들러
   const handleImageUpload = async (event) => {
      const uploadedFiles = Array.from(event.target.files);
      setFiles(uploadedFiles);
      const urls = uploadedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setPhotoUrls(urls);
   };

   // 📷 드래그 완료 시 이미지 순서 변경
   const handleSortEnd = (activeId, overId) => {
      if (activeId !== overId) {
         const oldIndex = previewUrls.findIndex((item) => item.id === activeId);
         const newIndex = previewUrls.findIndex((item) => item.id === overId);
         //setPreviewUrls(arrayMove(previewUrls, oldIndex, newIndex));
         // 정렬된 리스트를 새로운 ID와 함께 업데이트
         const updatedPreviewUrls = arrayMove(
            previewUrls,
            oldIndex,
            newIndex
         ).map((item, index) => ({
            ...item,
            id: `image-${index}`, // 🎯 정렬 후 새로운 ID 부여
         }));

         setPreviewUrls(updatedPreviewUrls);
         setFiles(arrayMove(files, oldIndex, newIndex));
         setPhotoUrls(arrayMove(photoUrls, oldIndex, newIndex));
      }
   };
   const handleSubmit = async () => {
      console.log("handleSubmit 실행 완료");
      console.log(title);
      console.log(country);
      console.log(dateRange);
      console.log(satisfaction);
      console.log(courseno); /* || courseno == 0 */
      if (!title || !country || !dateRange || !satisfaction ) {
         alert("필수 항목을 모두 입력해주세요.");
         return;
      }
      try {
         console.log(photoUrls);
         console.log(actualSchedule[0].types);
         const coursedata = actualSchedule.map((element) => ({
            tbd_day: element.day,
            tbd_time:
               element.time.includes("오전") || element.time.includes("오후")
                  ? convertTo24HourFormat(element.time)
                  : element.time,
            tbd_place: element.place,
            tbd_place_type: element.types?(Array.isArray(element.types)?element.types.join(","):element.types):null,
            tbd_content: element.details?element.details:null,
            //tbd_time_car: 10, // 임시로 10분으로 삽입
            //tbd_time_public: 15, // 임시로 15분으로 삽입
         }));
         const boardData = [
            {
               tb_title: title,
               tb_country: country,
               tb_city: city,
               tb_departure_date: dateRange[0],
               tb_return_date: dateRange[1],
               tb_star: satisfaction,
               tb_review: review,
               tb_public: visibility,
               tb_photo1: photoUrls[0] || null,
               tb_photo2: photoUrls[1] || null,
               tb_photo3: photoUrls[2] || null,
               user_id: localStorage.getItem("user_id"),
               cs_no: courseno,
            },
            { course: [...coursedata] },
         ];
         let response = -1;
         if (isEditMode) {
            // EditMode가 true일때만 tb_no 넘김
            response = await updateBoard(tb_no, boardData);
            console.log(response);
            if (response >= 1) {
               alert("글이 수정되었습니다.");
               navigate(`/board/${tb_no}`);
            }
         } else {
            console.log(boardData);
            response = await insertBoard(boardData);
            console.log(response);
            if (response >= 1) {
               alert("글이 등록되었습니다.");
               navigate("/board");
            }
         }
      } catch (error) {
         console.error("🔥 handleSubmit 내부 오류 발생:", error);
      }
   };

   return {
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
      addPlace,
      addSchedule,
      removeSchedule,
      handleRemoveFile,
      formatDate,
      handleSortEnd,
      handleDrop,
      handleDropToDelete,
      courseno,
      setCourseno,
      courseModal,
      setCourseModal,
      courses,
      setCourses,
      handleOpenCsModal,
   };
};

export default useBoard;
