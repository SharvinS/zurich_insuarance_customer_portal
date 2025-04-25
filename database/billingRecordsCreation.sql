CREATE TABLE "BILLING_RECORDS" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    photo VARCHAR(2048),
    product_code VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    premium_paid DECIMAL(10, 2) NOT NULL
);