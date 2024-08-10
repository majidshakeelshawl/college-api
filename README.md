# College API

This API provides a robust backend solution for managing digital services at a college. It is designed to handle events, notifications, and tender management efficiently.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install and run the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/college-api.git
   cd college-api

2. **Install Dependencies:**
   npm install

3. **Set up environment variables:**
   Create a .env file in the root directory and add the necessary environment variables. Refer to the Environment Variables section for required variables.

4. **Run the development server:**
   npm run dev


## Features
- Event Management: Add, update, delete, and retrieve event details.
- Notification System: Manage and send notifications to users.
- Tender Management: Handle tender-related operations with ease.
- Authentication: Secure API endpoints using JSON Web Tokens (JWT).
- File Upload: Use Multer and GridFS for handling file uploads.

## Usage
This API is designed for use by the college’s website to manage various digital services. It provides a RESTful interface for handling operations related to events, notifications, and tenders.

## API Endpoints
Here’s a brief overview of the main API endpoints:

- Events

  - GET /api/events: Retrieve all events.
  - POST /api/events: Create a new event.
  - PUT /api/events/:id: Update an existing event.
  - DELETE /api/events/:id: Delete an event.

- Notifications
  - GET /api/notifications: Retrieve all notifications.
  - POST /api/notifications: Create a new notification.

- Tenders
  - GET /api/tenders: Retrieve all tenders.
  - POST /api/tenders: Create a new tender.
 
 ## Environment Variables
The following environment variables need to be set in the .env file:

- PORT: The port number to run the server on.
- MONGO_URI: MongoDB connection string.
- JWT_SECRET: Secret key for JWT authentication.

## License
This project is licensed under the GNU General Public License v3.0 (GPLv3). See the LICENSE file for details.

**Summary**
The GPLv3 license allows you to freely use, modify, and distribute this software, provided that any derivative works are also licensed under the GPLv3. This ensures that the software and its derivatives remain free and open-source.
