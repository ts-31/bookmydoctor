# 🩺 BookMyDoctor -- Doctor Appointment Booking Platform (MERN)

## 📌 Project Overview

**BookMyDoctor** is a full-stack **MERN** application designed to
simplify and digitize the process of booking doctor appointments.\
It supports **Patients**, **Doctors**, and **Admins** through role-based
dashboards, secure authentication, and streamlined appointment
workflows.

------------------------------------------------------------------------

## 🚀 Key Features

### 👤 Patient (User)

-   Secure JWT-based authentication
-   Profile management with image upload
-   Browse doctors by speciality
-   Book, view, and cancel appointments
-   Appointment history tracking

### 🩺 Doctor

-   Secure login with role-based access
-   Manage appointments (confirm, complete, cancel)
-   Update profile details (education, experience, speciality)
-   Dashboard with appointment insights

### 🛠️ Admin

-   Secure admin authentication
-   Add and manage doctors with image uploads
-   Toggle doctor availability
-   View all appointments and platform analytics
-   Admin dashboard metrics

### 🔐 Security & Architecture

-   JWT authentication for all roles
-   Password hashing using bcrypt
-   Role-based route protection middleware
-   Image uploads via Multer + Cloudinary
-   Centralized error handling
-   RESTful API design with proper status codes

------------------------------------------------------------------------

## 📁 Project Structure

    bookmydoctor/
    ├── server/        # Node.js + Express backend
    ├── client/        # Patient-facing React app
    ├── admin/         # Admin & Doctor dashboard (React)

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Backend

-   Node.js, Express.js
-   MongoDB + Mongoose
-   JWT Authentication
-   bcrypt
-   Cloudinary & Multer
-   dotenv, cors

### Frontend

-   React (Vite)
-   Tailwind CSS
-   Axios
-   React Router
-   React Toastify

------------------------------------------------------------------------

## 🔧 Installation & Setup

### Prerequisites

-   Node.js
-   MongoDB Atlas
-   Cloudinary Account

### 1️⃣ Clone Repository

``` bash
git clone <your-repo-url>
cd bookmydoctor
```

### 2️⃣ Backend Setup

``` bash
cd server
npm install
```

Create `.env`:

    PORT=8000
    MONGODB_URI=<mongodb_uri>
    JWT_SECRET=<secret>
    CLOUDINARY_NAME=<name>
    CLOUDINARY_API_KEY=<key>
    CLOUDINARY_API_SECRET=<secret>
    ADMIN_EMAIL=<email>
    ADMIN_PASSWORD=<password>

Start server:

``` bash
npm run server
```

### 3️⃣ Client Setup

``` bash
cd ../client
npm install
npm run dev
```

Create `.env`:

    VITE_BACKEND_URL=http://localhost:8000


### 4️⃣ Admin Setup

``` bash
cd ../admin
npm install
npm run dev
```

Create `.env`:

    VITE_BACKEND_URL=http://localhost:8000


------------------------------------------------------------------------

## 🌐 API Endpoints (Sample)

### Admin

-   POST `/api/admin/login`
-   POST `/api/admin/add-doctor`
-   GET `/api/admin/all-doctors`
-   GET `/api/admin/dashboard`

### Doctor

-   POST `/api/doctor/login`
-   GET `/api/doctor/appointments`
-   POST `/api/doctor/update-profile`

### User

-   POST `/api/user/register`
-   POST `/api/user/login`
-   POST `/api/user/book-appointment`
-   GET `/api/user/appointments`

------------------------------------------------------------------------

## 🚀 Future Enhancements

-   Payment gateway integration
-   Email & SMS notifications
-   Doctor availability calendar
-   Pagination & advanced search
-   Admin analytics charts

------------------------------------------------------------------------

## 👨‍💻 Author

**Tejas Sonawane**

-   GitHub: https://github.com/ts-31

------------------------------------------------------------------------


### ⭐ If you like this project, give it a star!
