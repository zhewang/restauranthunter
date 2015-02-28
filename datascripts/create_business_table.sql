CREATE TABLE business (
    business_id CHAR(22),
    name VARCHAR(255) ,
    full_address VARCHAR(255),
    city VARCHAR(127),
    state VARCHAR(5),
    latitude DOUBLE(10,6),
    longitude DOUBLE(10,6),
    stars FLOAT(2),
    review_count INT,
    open BOOLEAN,
    PRIMARY KEY (business_id)
);