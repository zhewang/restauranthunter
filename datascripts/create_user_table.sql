CREATE TABLE user (
    user_id CHAR(22),
    name VARCHAR(255),
    review_count INT,
    average_stars FLOAT(3,2),
    yelping_since CHAR(7),
    PRIMARY KEY (user_id)
);