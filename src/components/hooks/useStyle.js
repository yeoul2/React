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
        borderColor: "orange",
      },
      outline: "none", // 아웃라인 제거
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "orange" : "white",
      color: state.isSelected ? "black" : "black",
      "&:active": {
        backgroundColor: "#FFDAB9", // 연한 오렌지 (PeachPuff) // 클릭(누르고 있는 중) 상태일 때 색상 변경
        color: "white",
      },
    }),
    input: (styles) => ({
      ...styles,
      opacity: 0, // 입력 필드 숨김
      pointerEvents: "none", // 마우스 이벤트 차단
    }),
  };

  return customStyles;
};

export default useStyle;
