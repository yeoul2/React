export const googleLogin = () => {
    const googleClientId = "1079080191923-bfsmh4mludaa0psak7odfkgj8ca6orv5.apps.googleusercontent.com";// 클라이언트 ID 확인
    const redirectUri = "http://localhost:7007/login/oauth2/code/google"; // 백엔드로 보내야함 리디렉션 URL
    const scope = "email profile openid"; // OAuth 인증시 요청할 권한
    const responseType = "code"; // OAuth 표준 방식 보안상 백엔드에서 code를 accessToken으로 변환시킴
    const accessType = "offline"; // Refresh Token을 받아서 사용자가 앱을 닫아도 자동 로그인

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth
    ?client_id=${googleClientId}
    &redirect_uri=${encodeURIComponent(redirectUri)}
    &response_type=${responseType}
    &scope=${encodeURIComponent(scope)}
    &access_type=${accessType}`
    .replace(/\s+/g, "");//url에 불필요한 공백을 모두 제거

    console.log("🔗 Google Auth URL:", googleAuthUrl); //요청 URL 확인 로그
    window.location.href = googleAuthUrl; // 사용자를 구글 로그인페이지로 이동시키고 로그인 후 redirectUri로 리디랙션함
};
