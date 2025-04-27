# SWIFT Code API

## Overview

This application provides a RESTful API to manage SWIFT codes for financial institutions. The SWIFT codes can represent both branches and headquarters of a bank. The SWIFT codes are parsed from a provided CSV file, stored in a database, and exposed through API endpoints for efficient retrieval.

The project consists of two parts:
1. **Backend**: A Spring Boot application with Hibernate and MySQL to handle the parsing, storing, and retrieval of SWIFT codes.
2. **Frontend**: A Next.js application to provide a user-friendly interface for interacting with the API.

Both parts are containerized using Docker, with separate Dockerfiles for the backend and frontend, and a root-level `docker-compose.yml` file to bring everything together.

## Key Features
- **Parse SWIFT Code Data**: Efficient parsing of SWIFT codes from the provided CSV file.
- **Store Data**: Store parsed SWIFT codes in a MySQL database using Hibernate.
- **REST API**: Expose the SWIFT code data through RESTful endpoints.
- **Containerized**: Both the backend and frontend are containerized using Docker for easy setup and deployment.

## Project Structure

- **swift-api (Backend)**: 
  - Built with Spring Boot, Hibernate, and MySQL.
  - Handles parsing, storing, and serving SWIFT code data.
  
- **frontend (Frontend)**: 
  - Built with Next.js.
  - Provides a user interface for interacting with the backend API.

## Getting Started

### Prerequisites

1. **Docker**: If Docker is not installed, follow [this guide](https://www.docker.com/get-started) to install it.

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/medamineharbaoui/Remitly_Technical_Test
   cd Remitly_Technical_Test
   ```

2. **Build and Run the Application**:
   First make sure that the PORTS *3306* , *8080* and *3000* are available.
   Use Docker to build and run the application and database containers:
   ```bash
   docker-compose up --build
   ```
   This may take a few minutes. You will know the setup is complete when you see the message:
   ```
   SWIFT codes imported from CSV.
   ```

3. **Access the Application**:
   - **Frontend**: Open your browser and go to `http://localhost:3000` to access the homepage. Click "Explore SwiftCodes App" to navigate to the dashboard (`/dashboard`).
   - **Backend**: The RESTful API is accessible at `http://localhost:8080`.

### Importing & Parsing SWIFT Codes
- **Frontend**: Upload CSV files directly through the frontend dashboard.
- **Backend**: The backend provides an endpoint `/v1/swift-codes/import` to upload and **parse CSV files**.

## API Endpoints

1. **Retrieve SWIFT Code Details**
   - **GET**: `/v1/swift-codes/{swift-code}`
   - **Response Structure (Headquarters)**:
     ```json
     {
       "address": "string",
       "bankName": "string",
       "countryISO2": "string",
       "countryName": "string",
       "isHeadquarter": true,
       "swiftCode": "string",
       "branches": [
         {
           "address": "string",
           "bankName": "string",
           "countryISO2": "string",
           "isHeadquarter": false,
           "swiftCode": "string"
         }
       ]
     }
     ```
   - **Response Structure (Branch)**:
     ```json
     {
       "address": "string",
       "bankName": "string",
       "countryISO2": "string",
       "countryName": "string",
       "isHeadquarter": false,
       "swiftCode": "string"
     }
     ```

2. **Retrieve SWIFT Codes by Country**
   - **GET**: `/v1/swift-codes/country/{countryISO2code}`
   - **Response Structure**:
     ```json
     {
       "countryISO2": "string",
       "countryName": "string",
       "swiftCodes": [
         {
           "address": "string",
           "bankName": "string",
           "countryISO2": "string",
           "isHeadquarter": true,
           "swiftCode": "string"
         }
       ]
     }
     ```

3. **Add a New SWIFT Code**
   - **POST**: `/v1/swift-codes`
   - **Request Structure**:
     ```json
     {
       "address": "string",
       "bankName": "string",
       "countryISO2": "string",
       "countryName": "string",
       "isHeadquarter": true,
       "swiftCode": "string"
     }
     ```
   - **Response Structure**:
     ```json
     {
       "message": "SWIFT code added successfully"
     }
     ```

4. **Delete a SWIFT Code**
   - **DELETE**: `/v1/swift-codes/{swift-code}`
   - **Response Structure**:
     ```json
     {
       "message": "SWIFT code deleted successfully"
     }
     ```

## Testing

### Run Tests
To ensure the application is functioning as expected, you can run the tests with the following command:
```bash
mvn test
```

### Manual Testing
You can test the API manually using Postman or any other HTTP client.



