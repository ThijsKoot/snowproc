CREATE ROLE COURSE_ADMIN_ROLE;
GRANT ROLE SECURITYADMIN TO ROLE COURSE_ADMIN_ROLE;
GRANT ROLE SYSADMIN TO ROLE COURSE_ADMIN_ROLE;
GRANT ROLE COURSE_ADMIN_ROLE TO ROLE ACCOUNTADMIN;

USE ROLE COURSE_ADMIN_ROLE;

CREATE DATABASE COURSE_ADMIN;
CREATE TABLE COURSE_ADMIN.PUBLIC.COURSE
(
    COURSENAME STRING,
    USERCOUNT INTEGER,
    USERPASSWORD STRING,
    USERS VARIANT
);