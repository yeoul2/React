use trip_db;

-- 최근 검색어 테이블 삭제
DROP TABLE IF EXISTS recent_searches;

-- 인기 검색어 테이블 삭제
DROP TABLE IF EXISTS popular_searches;


CREATE TABLE `recent_searches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,  -- 🔥 기존 `user_no (INT)` → `user_id (VARCHAR(50))`로 변경
  `search_term` varchar(255) NOT NULL,
  `search_type` enum('country','city') NOT NULL,
  `search_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_recent` (`user_id`, `search_date`),  -- 🔥 `user_no` 대신 `user_id` 사용
  CONSTRAINT `fk_recent_searches_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);


CREATE TABLE `popular_searches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `search_term` varchar(255) NOT NULL,
  `search_type` enum('country','city') NOT NULL,
  `search_count` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_search_term_type` (`search_term`, `search_type`),
  KEY `idx_search_count` (`search_count`)
);
