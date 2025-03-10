import React from "react";
import { useNavigate } from "react-router";

const companyLinks = ["소개", "채용정보", "뉴스룸"];
const supportLinks = ["도움말 센터", "안전 정보", "예약 취소 옵션"];
const socialLinks = [
  { icon: "fab fa-facebook-f", url: "#" },
  { icon: "fab fa-twitter", url: "#" },
  { icon: "fab fa-instagram", url: "#" },
];

const Footer = () => {
  const navigate = useNavigate(); // 네비게이션 훅 사용
  return (
    <footer className="bg-sky-200 text-gray-900 py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 설명 */}
          <div>
            <img
              src="/images/Yeoul_Logo.png"
              alt="로고"
              className="h-12 mb-4"
              onClick={() => {
                navigate("/");
              }}
            />
            <p className="font-bold text-sm">세계의 문화와 축제를 경험하는 특별한 여행</p>
          </div>

          {/* 회사 소개 */}
          <div>
            <h3 className="font-bold mb-4">회사 소개</h3>
            <ul className="space-y-2 text-sm text-gray-900 hover:text-orange-400">
              {companyLinks.map((link, index) => (
                <li key={index}>{link}</li>
              ))}
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="font-bold mb-4">고객 지원</h3>
            <ul className="space-y-2 text-sm text-gray-900 hover:text-orange-400">
              {supportLinks.map((link, index) => (
                <li key={index}>{link}</li>
              ))}
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="font-bold mb-4">팔로우</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.url} className="text-gray-900 hover:text-orange-400">
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 저작권 정보 */}
        <div className="border-t border-gray-900 mt-8 pt-8 text-sm text-gray-900">
          <p>&copy; 2025 세계 문화 축제 여행 가이드. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
