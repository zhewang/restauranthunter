CREATE TABLE review (
    review_id INT AUTO_INCREMENT,
    business_id CHAR(22) NOT NULL,
    user_id CHAR(22) NOT NULL,
    stars FLOAT(2,1),
    date CHAR(10),
    PRIMARY KEY (review_id),
    INDEX (business_id),
    INDEX (user_id)
);