# Design and Security Decisions

## Purpose

This document explains the architectural and security decisions made while developing the **Secure Authentication Service**.  
The objective is to demonstrate understanding of authentication workflows, backend design principles, and security best practices.

Implementation details are intentionally not repeated here, as they are already visible in the codebase.

---

## High-Level Architecture

The application follows a clear layered architecture:

- **Routes**  
  Define HTTP endpoints and map incoming requests.

- **Controllers**  
  Handle request validation and prepare responses.

- **Services**  
  Contain core authentication and business logic.

- **Middleware**  
  Enforce cross-cutting concerns such as authentication and rate limiting.

- **Database Layer**  
  Manages persistent storage using PostgreSQL.

This separation improves readability, testability, and security by enforcing clear responsibility boundaries.

---

## Authentication Flow

### Registration

- User submits registration data  
- Inputs are validated (email, password, display name)  
- Password is hashed using Argon2id  
- User data is stored in the database  
- No sensitive information is returned in the response  

---

### Login

- User submits email and password  
- User existence is verified  
- Password is validated using a timing-safe comparison  
- Access and refresh tokens are issued  
- Refresh token is stored as an HTTP-only cookie  

---

### Authenticated Requests

- Access token is sent via the `Authorization: Bearer` header  
- Middleware validates token signature and expiration  
- Protected resource is returned if the token is valid  

---

### Token Refresh

- Refresh token is sent automatically via cookie  
- Token validity and revocation status are checked  
- Old refresh token is invalidated  
- New access and refresh tokens are issued  

---

### Logout

- Refresh token is revoked in the database  
- Refresh token cookie is cleared  
- Access token is removed from client storage  

---

## Token Strategy

### Access Tokens

- Short-lived (15 minutes)  
- Stored in browser localStorage  
- Used for accessing protected endpoints  

---

### Refresh Tokens

- Long-lived (7 days)  
- Stored as HTTP-only cookies  
- Never accessible via JavaScript  
- Stored in the database as SHA-256 hashes  
- Rotated on every refresh request  

This strategy balances usability with security and limits the impact of token compromise.

---

## Refresh Token Rotation and Theft Detection

- Refresh tokens are single-use  
- Tokens are invalidated immediately after refresh  
- Reuse of a revoked refresh token invalidates all sessions for the user  
- User is required to re-authenticate  

This prevents replay attacks using stolen refresh tokens.

---

## Password Security

### Choice of Argon2id

Argon2id was chosen because it is:

- Memory-hard and resistant to GPU attacks  
- Recommended by modern security standards  
- Resistant to side-channel attacks  

---

### Password Handling

- Passwords are never stored or logged in plaintext  
- Hashing occurs before database storage  
- Timing-safe verification prevents timing attacks  

---

## Input Validation and Error Handling

- Email format and normalization are enforced  
- Password strength requirements are validated  
- Display names are length-restricted  
- Parameterized queries prevent SQL injection  

Authentication error messages are intentionally generic to prevent user enumeration attacks.

---

## Rate Limiting

Login attempts are rate-limited to reduce the risk of brute-force attacks while maintaining acceptable user experience.  
Rate limiting is applied only to sensitive authentication endpoints.

---

## Frontend Security Considerations

- Access tokens are stored in localStorage  
- Refresh tokens are stored in HTTP-only cookies  
- Automatic token refresh is handled transparently  
- Session expiration is clearly communicated to the user  

---

## Database Design

### Tables

- `users`  
- `refresh_tokens`  

---

### Design Decisions

- Minimal table structure  
- Foreign keys with cascade delete  
- Indexed lookups for performance  
- Refresh tokens stored as hashes  

---

## Trade-offs and Limitations

Due to scope and time constraints:

- No multi-factor authentication  
- No centralized logging system  
- No Redis-based token blacklist  
- Minimal frontend without frameworks  

These decisions were intentional to focus on core authentication correctness.

---

## Production Considerations

Before deploying to production, the following should be addressed:

- Enforce HTTPS and secure cookies  
- Use environment-specific secrets  
- Add audit logging  
- Introduce MFA for sensitive accounts  
- Use managed database services and backups  

---

## Conclusion

This project demonstrates a secure and well-structured authentication system with intentional architectural and security decisions.  
It is suitable for academic evaluation and can be extended into a production-ready service.
