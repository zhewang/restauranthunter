CREATE TABLE review (
    review_id INT AUTO_INCREMENT,
    business_id CHAR(22) NOT NULL,
    user_id CHAR(22) NOT NULL,
    stars FLOAT(2,1),
    data CHAR(10),
    PRIMARY KEY (review_id),
    FOREIGN KEY (business_id) REFERENCES business (business_id),
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);