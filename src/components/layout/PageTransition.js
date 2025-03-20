import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
   const location = useLocation();
   const [loading, setLoading] = useState(true);
   const [randomImage, setRandomImage] = useState("");
   const [imageSize, setImageSize] = useState({ width: 400, height: 400 })

   useEffect(() => {
      setLoading(true); // 페이지 이동 시 로딩 시작
      window.scrollTo(0, 0); // 페이지 이동 전 스크롤을 맨 위로 설정

      // 0~8 사이의 랜덤 숫자를 생성하여 이미지 경로 설정
      const randomIndex = Math.floor(Math.random() * 9);
      const imagePath = `/images/page_gif/cb${randomIndex}.gif`;
      // 이미지 크기 가져오기
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
         const { width, height } = img;
         let maxWidth = 400;
         let maxHeight = 400;
         
         if (width > height) {
            // 가로가 더 긴 경우
            maxWidth = 600;
            maxHeight = (height / width) * 600;
         } else if (height > width) {
            // 세로가 더 긴 경우
            maxHeight = 500;
            maxWidth = (width / height) * 500;
         }
         
         setImageSize({ width: maxWidth, height: maxHeight });
         setRandomImage(imagePath);
         setTimeout(() => setLoading(false), 1500); // 1.5초 후 실제 페이지 표시
      };
            
   }, [location]);

   return (
      <>
         {loading ? (
            <div style={styles.loadingContainer}>
               {randomImage && (
               <img
                  src={randomImage}
                  alt="로딩 중..."
                  style={{
                     width: `${imageSize.width}px`,
                     height: `${imageSize.height}px`,
                     /* marginBottom: "10px", */
                  }}
               />
               )}
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
   loadingText: {
      fontSize: "48px",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
   },
};

export default PageTransition;