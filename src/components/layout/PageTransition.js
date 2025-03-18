import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
   const location = useLocation();
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true); // 페이지 이동 시 로딩 시작
      window.scrollTo(0, 0); // 페이지 이동 전 스크롤을 맨 위로 설정
      setTimeout(() => setLoading(false), 1500); // 1.5초 후 실제 페이지 표시
   }, [location]);

   return (
      <>
         {loading ? (
            <div style={styles.loadingContainer}>
               <img
                  src="/images/icon_image/loading_1.25.gif"
                  alt="로딩 중..."
                  style={styles.loadingImage}
               />
               <h1 style={styles.loadingText}>Loading...</h1>
            </div>
         ) : (
            children
         )}
      </>
   );
};

const styles = {
   loadingContainer: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column", // 요소들을 세로로 정렬
      justifyContent: "center", // 중앙 정렬
      alignItems: "center", // 가로축 중앙 정렬
      backgroundColor: "#fff",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999, // 최상단에 위치
   },
   loadingImage: {
      width: "300px", // GIF 크기 조절
      marginBottom: "10px", // 이미지 아래 여백 추가 (글자와 간격 조절)
   },
   loadingText: {
      fontSize: "48px",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
   },
};

export default PageTransition;