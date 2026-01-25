# Booking Backend

Backend for the booking website built with Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`) and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/booking_db
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

3. Make sure MongoDB is running locally

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/admin/login` - Admin login

### Bookings
- POST `/api/bookings/create` - Create booking (auth required)
- GET `/api/bookings/my-bookings` - Get user's bookings
- GET `/api/bookings/all-bookings` - Get all bookings (admin only)
- PUT `/api/bookings/:bookingId/status` - Update booking status (admin only)

### Contact
- POST `/api/contact/send` - Submit contact form
- GET `/api/contact/all-messages` - Get all messages (admin only)
- PUT `/api/contact/:messageId/status` - Update message status (admin only)

### Admin
- GET `/api/admin/dashboard/stats` - Get dashboard statistics (admin only)
