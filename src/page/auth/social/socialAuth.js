// 소셜로그인 공통 로직

/* export const handelSocialLogin = (provider) => {
    let clientId, redirectUri, authUrl;

    switch(provider){
        case "google":
            clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
            redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth
            ?client_id=${clientId}
            &redirect_uri=${encodeURIComponent(redirectUri)}
            &response_type=token
            &scope=${encodeURIComponent("email profile openid")}
            &access_type=offline`
            .replace(/\s+/g, ""); // ✅ 불필요한 공백 제거
            break
        case "naver":
            clientId = process.env.REACT_APP_NAVER_CLIENT_ID
            redirectUri = process.env.REACT_APP_NAVER_REDIRECT_URI
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth
            ?client_id=${clientId}
            &redirect_uri=${encodeURIComponent(redirectUri)}
            &response_type=code
            &scope=${encodeURIComponent("email profile openid")}`
            .replace(/\s+/g, "");
            break
            default:
            console.log("지원되지 않는 로그인 방식입니다.")
    }
        console.log(`🔗 ${provider.toUpperCase()} 로그인 URL:`, authUrl);
        window.location.href = authUrl;

} */