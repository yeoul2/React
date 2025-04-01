INSERT INTO users (user_id, username, password)
VALUES ('mm0307y', '김민태', 'Aa123132!');


INSERT INTO search_history (user_id, search_term, search_type, search_date)
VALUES 
('mm0307y', '서울', 'city', NOW()),
('mm0307y', '도쿄', 'city', NOW() - INTERVAL 1 DAY),
('mm0307y', '뉴욕', 'city', NOW() - INTERVAL 2 DAY),
('mm0307y', '파리', 'city', NOW() - INTERVAL 3 DAY),
('mm0307y', '런던', 'city', NOW() - INTERVAL 4 DAY);


INSERT INTO popular_searches (search_term, search_type, search_count)
VALUES 
('서울', 'city', 5),
('도쿄', 'city', 3),
('뉴욕', 'city', 2),
('파리', 'city', 1);

select * from popular_searches;

select * from search_history;

SELECT * FROM search_history WHERE user_id = 'mm0307y';

SELECT DISTINCT search_term FROM search_history WHERE search_term LIKE '서%';




