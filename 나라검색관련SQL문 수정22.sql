use trip_db;



INSERT INTO popular_searches (search_term, search_type, search_count)
VALUES ('서울', 'city', 1)
ON DUPLICATE KEY UPDATE search_count = search_count + 1;

ALTER TABLE popular_searches ADD UNIQUE (search_term, search_type);



INSERT INTO recent_searches (user_id, search_term, search_type)
VALUES ('mm0307y', '서울', 'city');


SHOW INDEX FROM popular_searches;

ALTER TABLE popular_searches DROP INDEX search_term;
ALTER TABLE popular_searches ADD UNIQUE (search_term, search_type);

SELECT * FROM recent_searches;
SELECT * FROM recent_searches WHERE search_term = '서울' ORDER BY search_date DESC;

select * from popular_searches;

SELECT * FROM recent_searches;

ALTER TABLE popular_searches DROP INDEX search_term;
SHOW INDEX FROM popular_searches;

SELECT * FROM recent_searches ORDER BY search_date DESC LIMIT 5;


INSERT INTO popular_searches (search_term, search_type, search_count)
VALUES ('서울', 'city', 1) 
ON DUPLICATE KEY UPDATE search_count = search_count + 1;

SELECT * FROM popular_searches WHERE search_term = '서울' AND search_type = 'city';

DELETE FROM recent_searches WHERE user_id = 'mm0307y' ORDER BY search_date ASC LIMIT 1;


