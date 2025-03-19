import React, { useState } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import Modal from "react-modal";
import { FaTrashAlt, FaSave } from "react-icons/fa";
import axios from "axios"; // ✅ 일정 저장을 위한 API 연동

// 📌 모달 스타일 설정
const modalStyles = {
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  content: {
    width: "60%",
    height: "60%",
    margin: "auto",
    padding: "20px",
    borderRadius: "10px",
  },
};

// 📌 지도 크기 설정
const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
};

// 📌 기본 지도 설정 (서울)
const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
  zoom: 12,
};

const PlannerPage = () => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [plans, setPlans] = useState([]); // AI가 만든 일정 목록
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0); // 현재 보고 있는 일정
  const [selectedComparisons, setSelectedComparisons] = useState([]); // 비교 선택 일정
  const [isModalOpen, setIsModalOpen] = useState(false); // 비교 모달 상태

  // 📌 AI 일정 생성
  const handleGeneratePlan = () => {
    if (plans.length >= 5) {
      alert("최대 5개의 일정만 생성할 수 있습니다.");
      return;
    }

    const newPlan = {
      id: Date.now(), // ✅ 고유한 ID 사용 (중복 방지)
      day: `DAY ${plans.length + 1}`,
      activities: [
        { time: "09:00", title: "🏰 명동 관광", desc: "쇼핑과 현지 음식 체험" },
        { time: "14:00", title: "🏛️ 경복궁", desc: "한국의 대표적인 고궁 관람" },
        { time: "18:00", title: "🌆 광화문 광장", desc: "야경 감상 및 저녁 식사" },
      ],
    };

    setPlans((prevPlans) => [...prevPlans, newPlan]);
    setSelectedPlanIndex(plans.length); // 새 일정이 추가되면 자동으로 해당 일정 보기
  };

  // 📌 일정 버튼 클릭 시 해당 일정으로 변경 (체크박스 클릭 시 일정 변경되지 않도록 수정)
  const handleSelectPlan = (index, event) => {
    if (event.target.type === "checkbox") {
      return;
    }
    setSelectedPlanIndex(index);
  };

  // 📌 일정 삭제
  const handleDeletePlan = () => {
    if (plans.length === 0) {
      alert("삭제할 일정이 없습니다.");
      return;
    }

    const deletedPlanId = plans[selectedPlanIndex].id;

    // ✅ 선택된 일정 삭제
    const updatedPlans = plans.filter((_, index) => index !== selectedPlanIndex);
    setPlans(updatedPlans);

    // ✅ 비교 리스트에서도 삭제된 일정 제거
    setSelectedComparisons((prev) => prev.filter((id) => id !== deletedPlanId));

    if (updatedPlans.length > 0) {
      setSelectedPlanIndex(0); // 첫 번째 일정으로 이동
    } else {
      setSelectedPlanIndex(null); // 모든 일정 삭제 시 초기화
    }
  };

  // 📌 일정 비교 선택 토글
  const toggleSelectComparison = (id) => {
    setSelectedComparisons((prev) => {
      if (prev.includes(id)) return prev.filter((planId) => planId !== id);
      if (prev.length < 3) return [...prev, id];
      return prev;
    });
  };

  // 📌 일정 저장 (백엔드 연동)
  const handleSavePlan = async () => {
    if (plans.length === 0) {
      alert("저장할 일정이 없습니다.");
      return;
    }

    try {
      const response = await axios.post("/api/schedule/save", { schedules: plans });
      if (response.status === 200) {
        alert("일정이 성공적으로 저장되었습니다!");
      }
    } catch (error) {
      console.error("일정 저장 실패:", error);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // 📌 모달 열기 및 닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 py-8 mt-16">
      {/* 📌 AI 추천 일정 생성 버튼 */}
      <div className="text-center mb-6">
        <button
          onClick={handleGeneratePlan}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-md"
        >
          AI 추천 일정 생성
        </button>
      </div>

      {/* 📌 일정 선택 및 비교 버튼 */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* 일정 선택 버튼 + 체크박스 (버튼 안에 포함, 체크박스 클릭 시 일정 변경 X) */}
        <div className="flex gap-2">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md w-32 justify-between ${selectedPlanIndex === index ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              onClick={(e) => handleSelectPlan(index, e)}
            >
              <span>일정 {index + 1}</span>
              <input
                type="checkbox"
                checked={selectedComparisons.includes(plan.id)}
                onChange={() => toggleSelectComparison(plan.id)}
                className="cursor-pointer"
              />
            </button>
          ))}
        </div>

        {/* 비교, 삭제, 저장 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={openModal}
            disabled={selectedComparisons.length < 2}
            className={`px-4 py-2 text-sm rounded-md ${selectedComparisons.length >= 2 ? "bg-orange-500 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
          >
            비교하기
          </button>
          <button onClick={handleDeletePlan} className="px-4 py-2 text-sm rounded-md bg-red-500 text-white">
            <FaTrashAlt className="mr-1" /> 삭제
          </button>
          <button onClick={handleSavePlan} className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white">
            <FaSave className="mr-1" /> 저장하기
          </button>
        </div>
      </div>

      {/* 📌 선택된 일정 표시 */}
      {plans.length > 0 && selectedPlanIndex !== null && (
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-lg font-medium mb-2">{plans[selectedPlanIndex].day}</h3>
          <div className="space-y-3">
            {plans[selectedPlanIndex].activities.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-20 text-sm text-gray-500">{activity.time}</div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📌 비교 모달 */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyles}>
        <h2 className="text-2xl font-bold mb-4">일정 비교</h2>
        <button onClick={closeModal} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg">
          확인
        </button>
        <div className="grid grid-cols-3 gap-4">
          {selectedComparisons.map((id) => {
            const plan = plans.find((p) => p.id === id);
            return (
              <div key={id} className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{plan.day}</h3>
                <ul>
                  {plan.activities.map((activity, idx) => (
                    <li key={idx}>{activity.time} - {activity.title}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Modal>
    </main>
  );
};

export default PlannerPage;
