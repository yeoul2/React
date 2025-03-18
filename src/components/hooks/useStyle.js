const useStyle = () => {
  // 선택 옵션 스타일 커스텀
  const customStyles = {
    control: (styles, { isFocused, isHovered }) => ({
      ...styles,
      borderColor: isFocused ? "orange" : isHovered ? "orange" : "orange",
      boxShadow: "none", // 포커스 시 기본 효과 제거
      borderRadius: "8px",
      cursor: "pointer", // 입력 필드처럼 보이지 않도록 변경
      "&:hover": {
        borderColor: "#fbd38d",
      },
      outline: "none", // 아웃라인 제거
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#fbd38d" : "white",
      color: state.isSelected ? "black" : "black",
      "&:active": {
        backgroundColor: "#fbd38d", // 연한 오렌지 (PeachPuff) // 클릭(누르고 있는 중) 상태일 때 색상 변경
        color: "white",
      },
    }),
    input: (styles) => ({
      ...styles,
      opacity: 0, // 입력 필드 숨김
      pointerEvents: "none", // 마우스 이벤트 차단
    }),
  };

  // id *표시하기
  const maskUserId = (userId) => {
    if (!userId) return ""; // userId가 없는 경우 빈 문자열 반환

    const visibleLength = 3; // 앞 3글자 표시
    const fixedMask = "***"; // 항상 동일한 '*' 개수

    return userId.substring(0, visibleLength) + fixedMask;
  };

  return {customStyles, maskUserId};
};

export default useStyle;
