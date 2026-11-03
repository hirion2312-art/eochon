/* Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹) 의 firebaseConfig 값을 그대로 붙여 넣으세요.
   비워 두면 게임은 혼자 모드(브라우저에만 저장)로 돌아가요. */
window.EOCHON_FIREBASE = {
  apiKey: "여기에-apiKey",
  authDomain: "프로젝트ID.firebaseapp.com",
  databaseURL: "https://프로젝트ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "프로젝트ID",
  storageBucket: "프로젝트ID.appspot.com",
  messagingSenderId: "",
  appId: "",
  kakao: false,   // 카카오 로그인(OIDC)을 설정했으면 true
};
