# Student Management System (Node Express.js)

This project consists of an Node Express.js API backend. Follow these instructions to set up and run the application.

For detailed documentation about JWT implementation, database schema, queries, and performance metrics, please refer to our [Documentation](docs/DOCUMENTATION.md).

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- PostgreSQL database

## Project Structure

```
/student_management_system_api
├── config/           # Configuration files
├── docs/            # Project documentation
├── sql/            # SQL scripts and database dumps
├── src/
│   ├── config/      # Application configuration
│   ├── middleware/  # Express middleware
│   ├── migrations/  # Database migrations
│   ├── models/      # Sequelize models
│   ├── routes/      # API routes
│   ├── seeders/     # Database seeders
│   └── index.js     # Application entry point
├── .env             # Environment variables
└── openapi.yaml     # API documentation
```

## API Setup

1. Clone the project and Navigate to the directory:

   ```bash
   git clone https://github.com/themaruf/student_management_system_api.git
   cd student_management_system_api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the with the following content:

   ```env
      PORT=3000
      NODE_ENV=development

      DB_HOST=localhost
      DB_PORT=5432
      DB_NAME=student_management
      DB_USER=postgres
      DB_PASSWORD=postgres

      JWT_SECRET=mysecretkey
      JWT_EXPIRES_IN=1h

      DEFAULT_PAGE_SIZE=10
      MAX_PAGE_SIZE=100

      API_RATE_LIMIT=1000
   ```

4. Set up and import dummy data into database (Or you can use the dummy data provided in the `sql/student_management.sql` file):

   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate --migrations-path src/migrations
   npx sequelize-cli db:seed:all --seeders-path src/seeders
   ```

5. Start the API server:
   ```bash
   npm start
   ```

The API will be running at `http://localhost:3000`

## API Endpoints

```bash
Auth Routes (/api/auth):

- POST /register - Register a new user
- POST /login - Login user
```

```bash
Institute Routes (/api/institutes):

- GET / - Get all institutes with pagination (Protected)
- GET /:id - Get institute by ID (Protected)
- POST / - Create new institute (Protected)
- PUT /:id - Update institute (Protected)
- DELETE /:id - Delete institute (Protected)
```

```bash
Student Routes (/api/students):

- GET / - Get all students with pagination (Protected)
- GET /:id - Get student by ID (Protected)
- POST / - Create new student (Protected)
- PUT /:id - Update student (Protected)
- DELETE /:id - Delete student (Protected)
```

```bash
Course Routes (/api/courses):

- GET / - Get all courses with pagination (Protected)
- GET /:id - Get course by ID (Protected)
- POST / - Create new course (Protected)
- PUT /:id - Update course (Protected)
- DELETE /:id - Delete course (Protected)
```

```bash
Result Routes (/api/results):

- GET / - Get all results with pagination (Protected)
- GET /:id - Get result by ID (Protected)
- POST / - Create new result (Protected)
- PUT /:id - Update result (Protected)
- DELETE /:id - Delete result (Protected)
```

```bash
Report Routes (/api/reports):

- GET /students/:instituteId - Get students by institute (Protected)
- GET /top-courses - Get top courses by enrollment (Protected)
- GET /top-students - Get top students by average score with ranking (Protected)
```

Note: All protected routes require JWT authentication via the verifyToken middleware.

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- Rate limiting
- Input sanitization
- Error handling

## License

This project is licensed under the MIT License.
