### Backend Solution Overview

# Zurich Billing API Backend

This project is a NestJS backend application designed to manage billing records for Zurich Insurance customers. It provides a RESTful API for CRUD (Create, Read, Update, Delete) operations on billing data, secured with Google Sign-In authentication and role-based authorization via JWT.

## Features

*   **CRUD Operations:** Manage billing records (product code, location, premium paid, customer details).
*   **Filtering:** Retrieve billing records filtered by 'product_code' and 'location'.
*   **Authentication:** Users authenticate via Google Sign-In on the frontend. The received Google ID token is sent to the backend ('/auth/google') for verification. Upon successful verification, the backend issues its own application-specific JWT.
*   **Authorization:** Subsequent requests to protected endpoints (POST, PUT, DELETE on '/billing') require the application JWT to be sent in the 'Authorization: Bearer <token>' header. Role-based access control (RBAC) requiring an 'admin' role is enforced by checking the roles embedded within the validated JWT payload. Admin role is assigned based on matching the user's email with an 'ADMIN_EMAIL' environment variable.
*   **Database Integration:** Uses TypeORM to interact with a PostgreSQL database.
*   **API Documentation:** Integrated Swagger UI available at '/api' for easy endpoint testing and documentation.
*   **Validation:** Uses 'class-validator' and DTOs (Data Transfer Objects) for request payload validation.
*   **Configuration:** Loads database credentials, Google Client ID, JWT secrets, and admin email from environment variables ('.env' file).
*   **CORS Enabled:** Configured to accept requests from 'http://localhost:3001'.

## Technology Stack

*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database ORM:** TypeORM
*   **Database:** PostgreSQL
*   **Authentication:** Google Sign-In (verification via 'google-auth-library'), JWT ('@nestjs/jwt')
*   **API Documentation:** Swagger
*   **Configuration:** @nestjs/config (dotenv)

## API Endpoints

The API endpoints are documented using Swagger UI. Once the application is running, navigate to:

'http://localhost:3000/api'

This interface allows you to view all available endpoints, their required parameters, request bodies, and responses. You can also test the endpoints directly from the Swagger UI.

**Key Endpoints:**

*   'POST /auth/google': Verifies a Google ID token and returns user info and an application JWT.
*   'GET /billing': Retrieve billing records (optional 'product_code', 'location' query params).
*   'POST /billing': Create a new billing record (Requires valid app JWT with 'admin' role).
*   'PUT /billing': Update a billing record by 'product_code' (Requires valid app JWT with 'admin' role).
*   'DELETE /billing': Delete a billing record by 'product_code' (Requires valid app JWT with 'admin' role).

## Authentication & Authorization

*   **Login Flow ('POST /auth/google'):**
    *   Frontend sends the Google ID token obtained after successful Google Sign-In.
    *   Backend verifies the token using 'google-auth-library'.
    *   Backend checks if the user's email matches the 'ADMIN_EMAIL' environment variable to determine roles ('admin' or 'user').
    *   Backend generates an application-specific JWT containing user ID (Google 'sub'), email, and roles.
    *   Backend returns user info and the application JWT to the frontend.
*   **Subsequent Requests ('AuthMiddleware' & 'RolesGuard'):**
    *   Applies to non-GET requests to '/billing'.
    *   Expects an 'Authorization' header with the application JWT: 'Authorization: Bearer <your_application_token_here>'.
    *   'AuthMiddleware' verifies the JWT's signature and expiration using the 'JWT_SECRET'.
    *   'RolesGuard' checks the 'roles' claim within the validated JWT payload against the required roles (e.g., ''admin'') defined by the '@Roles()' decorator.

To use protected endpoints via Swagger UI or API clients:
1.  First, authenticate via 'POST /auth/google' using a valid Google ID token to obtain the application JWT.
2.  For subsequent protected requests, provide the received application JWT in the 'Authorization: Bearer <token>' header.

### Frontend Solution Overview

# Zurich Customer Portal Frontend

This project is a Next.js application serving as the frontend for the Zurich Customer Portal. It allows users to log in using their Google account and view customer billing records fetched from a backend API.

## Features

*   **Google Sign-In:** Secure authentication using Google OAuth 2.0 via '@react-oauth/google'.
*   **Billing Record Display:** Fetches and displays a list of customer billing records from the backend API.
*   **Filtering:** Allows users to filter billing records by 'Product Code' and 'Location'.
*   **Email Masking:** Masks user email addresses by default, with an option to reveal them.
*   **State Management:** Uses Redux ('react-redux', 'redux-thunk') for managing authentication state globally.
*   **Responsive Design:** Basic responsive layout using CSS Modules.
*   **Logout Functionality:** Allows users to log out, clearing their session state.

## Technology Stack

*   **Framework:** Next.js
*   **Language:** JavaScript (with React)
*   **State Management:** Redux, React-Redux, Redux Thunk
*   **HTTP Client:** Axios
*   **Authentication:** @react-oauth/google
*   **Styling:** CSS Modules

## Authentication Flow

1.  The user visits the home page ('pages/index.js').
2.  They click the "Sign in with Google" button provided by '@react-oauth/google'.
3.  Upon successful Google authentication, the 'handleLoginSuccess' callback receives a Google ID credential token.
4.  The 'login' action ('store/actions/authActions.js') is dispatched with this Google token.
5.  The 'login' action sends the Google token to the backend endpoint ('POST /auth/google').
6.  The backend verifies the Google token, determines user roles (based on email matching 'ADMIN_EMAIL'), generates an application-specific JWT, and returns user data (derived from Google payload) and the application JWT.
7.  The frontend receives the response, stores the backend's application JWT in 'localStorage', and dispatches 'LOGIN_SUCCESS' with the user data from the backend.
8.  The 'authReducer' updates the Redux state ('isAuthenticated: true', 'user: {...}').
9.  Components subscribed to the Redux state (like 'pages/index.js' and 'pages/users.js') re-render.
10. The 'useEffect' hook in 'pages/index.js' detects 'isAuthenticated' is true and redirects the user to the '/users' page.
11. The 'useEffect' hook in 'pages/users.js' detects 'isAuthenticated' is true and proceeds to fetch billing data, including the application JWT from 'localStorage' in the 'Authorization' header.
12. Logout clears the 'localStorage' token and dispatches the 'LOGOUT' action, resetting the Redux state.

## State Management (Redux)

*   The application uses Redux to manage the global authentication state.
*   The 'auth' slice of the state ('store/reducers/authReducer.js') tracks:
    *   'isLoggingIn': Whether a login attempt is in progress.
    *   'isAuthenticated': Whether the user is currently logged in.
    *   'user': Information about the logged-in user (name, email, roles).
    *   'error': Any error message related to login.
*   Actions ('store/actions/authActions.js') trigger state changes via the reducer.
*   Components use 'useSelector' to read state and 'useDispatch' to dispatch actions.

## API Interaction ('pages/users.js')

*   The 'UsersPage' component fetches billing records from the backend API specified by 'NEXT_PUBLIC_BACKEND_API_URL'.
*   It uses 'axios.get' to make requests.
*   The 'fetchUsers' function handles constructing the request URL with optional 'product_code' and 'location' query parameters based on the filter state.
*   For requests made after login, 'fetchUsers' retrieves the application JWT from 'localStorage' and includes it in the 'Authorization: Bearer <token>' header.
*   Loading and error states are managed locally within the component using 'useState'.

### Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

# Prerequisites

*   Node.js
*   npm
*   Postgres Database with table name (Ensure sample data exists) as per requirements

# Database Setup

1.  **Set up a database Postgres.app:**
    *   Install and open Postgres.app.
    *   Create a schema 'CUSTOMER_BILLING_PORTAL' - CREATE DATABASE "CUSTOMER_BILLING_PORTAL";.
    *   Open schema to run in terminal.
    *   Run table creation script - database/billingRecordsCreation.sql.
    *   Run seeder script - database/billingRecordsSeeder.sql.
    *   Run 'SELECT * FROM "BILLING_RECORDS";' to verify database setup.

# Backend Setup

1.  **Navigate to the backend directory:**
    cd backend

2.  **Install dependencies:**
    npm install

3.  **Set up environment variables:**
    *   Create a '.env' file in the backend directory.
    *   Copy the contents of 'env.example' into '.env'.
    *   Fill in the necessary environment variables.

4.  **Start the backend server:**
    'npm run start'

    *   The backend server should now be running (check your terminal output for logs on which port on a port), typically 'http://localhost:3000' for application and 'http://localhost:3000/api' for Swagger UI.

# Frontend Setup

1.  **Navigate to the frontend directory (from the root):**
    cd frontend

2.  **Install dependencies:**
    npm install

3.  **Set up environment variables:**
    *   Create a '.env.local' file in the frontend directory.
    *   Copy the contents of '.env.example' into '.env'.
    *   Fill in the necessary environment variables.

4.  **Start the frontend development server:**
    'npm run start'
    *   The frontend development server should now be running (http://localhost:3001). Open it in your browser.
    *   The package.json script has been configured to start the application on port 3001. No specific command required for it.
