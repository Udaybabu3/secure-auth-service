# Secure Authentication Service

A secure authentication service built with Node.js, Express, and PostgreSQL.
This project was developed as part of a technical interview assignment to demonstrate correct backend design, authentication flows, and security best practices.

The repository contains both backend and frontend code along with complete instructions to run and test the application locally.

---

## Overview

This application implements a full authentication flow, including:

- User registration
- User login
- JWT-based access tokens
- Refresh token rotation
- Logout and token invalidation
- Protected API endpoints
- Automated and manual testing

The goal of the project is correctness, clarity, and reproducibility rather than UI complexity.

---

## Tech Stack

### Backend
- Node.js (v16 or higher)
- Express 5.2
- PostgreSQL 12+
- JWT (HS256)
- Argon2id for password hashing
- express-rate-limit
- dotenv
- Jest and Supertest for testing

### Frontend
- HTML, CSS, JavaScript (no framework)
- Fetch API for backend communication
- LocalStorage for access tokens
- HTTP-only cookies for refresh tokens

---

## Prerequisites

Ensure the following are installed on your system:

- Node.js v16 or higher  
  node --version
- npm v7 or higher  
  npm --version
- PostgreSQL v12 or higher  
  psql --version
- Git

---

## Project Structure
<img width="348" height="652" alt="image" src="https://github.com/user-attachments/assets/588a3768-d166-404f-88f1-b841dcd22799" />


## Installation and Setup

### 1. Clone the Repository

### 2. Backend Setup

cd backend
npm install

---

### 3. Environment Configuration

Create a .env file in the backend directory.

cp .env.example .env

Edit .env with your local configuration:

PORT=4000

JWT_SECRET=your_long_random_secret_key_here  

example: 

  JWT_SECRET=R9$kT3!aZQwM8@L@@2E^xP7HfC5yD%Jm



JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d

DB_HOST=localhost

DB_PORT=5432

DB_USER=postgres

DB_PASSWORD=your_postgres_password

DB_NAME=secure_auth

FRONTEND_ORIGIN=http://localhost:5500

Important notes:
- JWT_SECRET must be at least 32 characters long.
- Do not commit .env to version control.

---

### 4. Database Setup

Create Database:

psql -U postgres
CREATE DATABASE secure_auth;
\q

Load Schema:

psql -U postgres -d secure_auth -f db/schema.sql

Verify Tables:

psql -U postgres -d secure_auth
\dt
\q

Expected tables:
- users
- refresh_tokens

---

## Running the Application

### Start Backend Server

cd backend
npm start

Backend will be available at:
http://localhost:4000

---

### Serve Frontend

cd frontend

Open `register.html` using a static server (Live Server / http-server).

Frontend URL:
http://localhost:5500


---

## Running Tests

cd backend
npm test

Tests cover:
- Registration validation
- Login success and failure
- Token refresh
- Logout
- Protected route access
- Input validation

---

## Manual Testing Guide

### User Registration

Open:
http://localhost:5500/register.html

Expected:
- Successful registration
- Redirect to login page

---

### User Login

Open:
http://localhost:5500/index.html

Expected:
- Redirect to dashboard
- User information displayed

---

### Logout

Click logout from dashboard.

Expected:
- Redirect to login page
- Tokens invalidated

---

## API Summary

POST   /api/auth/register   Register user
POST   /api/auth/login      Login user
POST   /api/auth/refresh    Refresh token
POST   /api/auth/logout     Logout user
GET    /api/auth/me         Current user
GET    /api/protected       Protected route

---

## Notes

- All setup steps are documented
- Project runs fully on a local machine
- No additional configuration is required

---

## License

ISC License
