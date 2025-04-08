# Parking Management System

A comprehensive web application for managing parking facilities, built with Spring Boot and React.

## Overview

The Parking Management System is designed to streamline the process of parking slot management and booking. It provides an intuitive interface for users to book parking slots and for administrators to manage the parking facility efficiently.

## Features

### User Features
- User registration and authentication with JWT
- View available parking slots
- Book parking slots
- View and manage bookings
- User dashboard with booking history

### Admin Features
- Comprehensive admin dashboard
- Manage parking slots (add, edit, delete)
- View and manage all bookings
- User management
- System settings configuration

## Technology Stack

### Backend
- Java 21
- Spring Boot 3.2.2
- Spring Security with JWT Authentication
- Spring Data MongoDB
- Maven for dependency management

### Frontend
- React 18
- React Router for navigation
- Material-UI for responsive design
- Axios for API communication

### Database
- MongoDB

## Setup and Installation

### Prerequisites
- Java 21
- Node.js and npm
- MongoDB

### Backend Setup
1. Clone the repository
2. Navigate to the project root directory
3. Run `mvn clean install` to build the project
4. Run `mvn spring-boot:run` to start the backend server

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Database Configuration
The application is configured to connect to a MongoDB database. Update the `application.properties` file with your MongoDB connection details if needed:

```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=parking_management
```

## Usage

### User Access
- Register a new account
- Login with your credentials
- Browse available parking slots
- Book a slot for a specific time period
- View your bookings in the dashboard

### Admin Access
- Login with admin credentials
- Access the admin dashboard
- Manage parking slots, users, and bookings
- Configure system settings

## Project Structure

### Backend
- `controller`: REST API endpoints
- `model`: Data models
- `repository`: Database access interfaces
- `service`: Business logic
- `security`: Authentication and authorization
- `dto`: Data transfer objects
- `util`: Utility classes

### Frontend
- `components`: Reusable UI components
- `contexts`: React contexts for state management
- `pages`: Application pages
- `pages/admin`: Admin-specific pages

