# 🗄️ MongoDB Database Setup Guide

This guide walks you through setting up the MongoDB database for the **Online Movie Ticket Booking System**. It covers both local MongoDB installation and MongoDB Atlas (cloud) setup.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Option A: Local MongoDB Setup](#2-option-a-local-mongodb-setup)
3. [Option B: MongoDB Atlas (Cloud) Setup](#3-option-b-mongodb-atlas-cloud-setup)
4. [Connecting the Application to MongoDB](#4-connecting-the-application-to-mongodb)
5. [Importing Sample Data](#5-importing-sample-data)
6. [Using the Seed Script](#6-using-the-seed-script)
7. [Database Collections Overview](#7-database-collections-overview)
8. [Verifying the Database](#8-verifying-the-database)
9. [Common Issues & Troubleshooting](#9-common-issues--troubleshooting)

---

## 1. Prerequisites

- **Node.js** (v18 or above) — [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Community Server** (for local setup) — [Download MongoDB](https://www.mongodb.com/try/download/community)
- **MongoDB Shell (`mongosh`)** — [Install mongosh](https://www.mongodb.com/docs/mongodb-shell/install/)
- **MongoDB Database Tools** (for `mongoimport`) — [Install Database Tools](https://www.mongodb.com/docs/database-tools/installation/)

---

## 2. Option A: Local MongoDB Setup

### Step 1: Install MongoDB Community Server

#### On Ubuntu/Debian:
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### On Windows:
1. Download the MSI installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and select **"Complete"** installation.
3. Check **"Install MongoDB as a Service"** during installation.

#### On macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
```

### Step 2: Start the MongoDB Service

#### On Ubuntu/Debian:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod    # auto-start on boot
sudo systemctl status mongod    # verify it's running
```

#### On Windows:
MongoDB runs as a Windows Service automatically after installation. You can manage it from **Services** (`services.msc`).

#### On macOS:
```bash
brew services start mongodb-community@7.0
```

### Step 3: Verify MongoDB is Running
```bash
mongosh
```
You should see the MongoDB Shell prompt. Type `exit` to close.

The default connection string for local MongoDB is:
```
mongodb://127.0.0.1:27017/movie-ticket-booking
```

---

## 3. Option B: MongoDB Atlas (Cloud) Setup

### Step 1: Create an Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up (free tier available).

### Step 2: Create a Cluster
1. Click **"Build a Database"** → Select **"M0 Free Tier"**.
2. Choose a cloud provider (AWS/GCP/Azure) and region closest to you.
3. Click **"Create Cluster"**.

### Step 3: Create a Database User
1. Go to **Database Access** → **Add New Database User**.
2. Choose **Password** authentication.
3. Enter a username and a strong password.
4. Set privileges to **"Read and write to any database"**.
5. Click **"Add User"**.

### Step 4: Allow Network Access
1. Go to **Network Access** → **Add IP Address**.
2. Click **"Allow Access from Anywhere"** (for development) or add your specific IP.
3. Click **"Confirm"**.

### Step 5: Get the Connection String
1. Go to **Database** → Click **"Connect"** on your cluster.
2. Select **"Connect your application"**.
3. Copy the connection string. It will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movie-ticket-booking?retryWrites=true&w=majority
```
4. Replace `<username>` and `<password>` with your actual credentials.

---

## 4. Connecting the Application to MongoDB

### Step 1: Configure the `.env` File

Navigate to the `server/` directory and create a `.env` file:

```bash
cd server
touch .env
```

### Step 2: Add the MongoDB Connection String

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/movie-ticket-booking
JWT_SECRET=your_strong_secret_key_here
CLIENT_URL=http://localhost:5173
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movie-ticket-booking?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_key_here
CLIENT_URL=http://localhost:5173
```

> **Note:** Replace `your_strong_secret_key_here` with a long, random string for JWT token security.

---

## 5. Importing Sample Data

We provide a ready-to-import JSON file (`movies-seed.json`) in this `database/` folder. This file contains **20 sample movies** (10 Bollywood + 10 Hollywood) that you can directly import into MongoDB.

### Using `mongoimport` (Recommended)

#### For Local MongoDB:
```bash
# Navigate to the database folder
cd database

# Import the movies collection
mongoimport --db movie-ticket-booking --collection movies --file movies-seed.json --jsonArray
```

#### For MongoDB Atlas:
```bash
# Replace the connection string with your Atlas URI
mongoimport --uri "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movie-ticket-booking" --collection movies --file movies-seed.json --jsonArray
```

### Using MongoDB Compass (GUI Method)

1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass).
2. Connect using your connection string.
3. Select the `movie-ticket-booking` database (create it if it doesn't exist).
4. Click on the `movies` collection (create it if it doesn't exist).
5. Click **"Add Data"** → **"Import JSON or CSV file"**.
6. Select `movies-seed.json` from this folder.
7. Click **"Import"**.

### Using MongoDB Shell (`mongosh`)

```bash
# Connect to MongoDB
mongosh "mongodb://127.0.0.1:27017/movie-ticket-booking"

# Or for Atlas
mongosh "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/movie-ticket-booking"
```

Then inside `mongosh`, you can paste documents manually or use:
```javascript
// Check if data was imported
db.movies.find().pretty()
db.movies.countDocuments()
```

---

## 6. Using the Seed Script

The project also includes a **seed script** (`server/seed.js`) that automatically populates the entire database with sample users, movies, shows, and seats.

### Running the Seed Script

```bash
# Navigate to the server directory
cd server

# Make sure dependencies are installed
npm install

# Make sure .env is configured with MONGODB_URI

# Run the seed script
node seed.js
```

### What the Seed Script Creates

| Collection | Records Created | Details |
|------------|----------------|---------|
| **Users** | 2 | 1 Admin (`admin@example.com` / `admin123`) + 1 User (`client@example.com` / `user123`) |
| **Movies** | 20 | 10 Bollywood + 10 Hollywood movies with posters, trailers, and details |
| **Shows** | 60 | 3 shows per movie across different screens and times |
| **Seats** | ~3,480 | 58 seats per show (Rows A–F with Regular, Premium, Recliner categories) |

### Default Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| User | `client@example.com` | `user123` |

> ⚠️ **Warning:** The seed script **clears all existing data** before inserting new records. Do not run it on a production database.

---

## 7. Database Collections Overview

The application uses **5 collections** in the `movie-ticket-booking` database:

### `users`
Stores registered user accounts.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name of the user |
| `email` | String | Email address (unique) |
| `phone` | String | Phone number (unique) |
| `password` | String | Bcrypt-hashed password |
| `role` | String | `"user"` or `"admin"` |
| `avatar` | String | Profile picture URL |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### `movies`
Stores movie information.

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Movie title |
| `slug` | String | URL-friendly identifier (unique) |
| `description` | String | Movie synopsis |
| `posterUrl` | String | Movie poster image URL |
| `bannerUrl` | String | Banner/backdrop image URL |
| `genre` | Array of Strings | Movie genres (e.g., Action, Drama) |
| `language` | String | Language (default: English) |
| `durationMinutes` | Number | Duration in minutes |
| `rating` | Number | Rating out of 10 |
| `releaseDate` | Date | Release date |
| `cast` | Array of Strings | List of cast members |
| `trailerUrl` | String | YouTube trailer URL |
| `isActive` | Boolean | Whether the movie is visible |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### `shows`
Stores show/screening schedules.

| Field | Type | Description |
|-------|------|-------------|
| `movie` | ObjectId | Reference to `movies` collection |
| `theaterName` | String | Name of the theater |
| `screenName` | String | Screen/hall name |
| `showDate` | String | Show date (YYYY-MM-DD format) |
| `showTime` | String | Show time (HH:MM format) |
| `showDateTime` | Date | Combined date-time for sorting |
| `ticketPrice` | Number | Price per ticket |
| `totalSeats` | Number | Total seats available |
| `bookedSeatsCount` | Number | Number of seats booked |
| `format` | String | Show format (e.g., 2D, 3D, IMAX) |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### `seats`
Stores individual seat information for each show.

| Field | Type | Description |
|-------|------|-------------|
| `show` | ObjectId | Reference to `shows` collection |
| `seatNumber` | String | Seat identifier (e.g., A1, B5) |
| `row` | String | Row letter (A–F) |
| `number` | Number | Seat number within the row |
| `category` | String | `"Regular"`, `"Premium"`, or `"Recliner"` |
| `isBooked` | Boolean | Whether the seat is booked |
| `bookedByUser` | ObjectId | Reference to `users` collection |
| `bookedByBooking` | ObjectId | Reference to `bookings` collection |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### `bookings`
Stores ticket booking records.

| Field | Type | Description |
|-------|------|-------------|
| `bookingId` | String | Unique booking identifier |
| `user` | ObjectId | Reference to `users` collection |
| `movie` | ObjectId | Reference to `movies` collection |
| `show` | ObjectId | Reference to `shows` collection |
| `seats` | Array of Strings | List of booked seat numbers |
| `seatCount` | Number | Number of seats in the booking |
| `amount` | Number | Total booking amount |
| `paymentStatus` | String | `"pending"`, `"paid"`, or `"failed"` |
| `paymentMethod` | String | Payment method (default: simulation) |
| `qrCode` | String | QR code data URL for the ticket |
| `emailStatus` | String | `"not_configured"`, `"sent"`, or `"failed"` |
| `createdAt` | Date | Booking creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## 8. Verifying the Database

After importing data or running the seed script, verify everything is set up correctly:

```bash
# Connect to MongoDB shell
mongosh "mongodb://127.0.0.1:27017/movie-ticket-booking"

# Check all collections
show collections

# Count documents in each collection
db.users.countDocuments()
db.movies.countDocuments()
db.shows.countDocuments()
db.seats.countDocuments()
db.bookings.countDocuments()

# View sample movie
db.movies.findOne()

# View all movies with title and rating
db.movies.find({}, { title: 1, rating: 1 }).pretty()
```

Expected output after seeding:
```
users   → 2 documents
movies  → 20 documents
shows   → 60 documents
seats   → ~3,480 documents
bookings → 0 documents (created when users book tickets)
```

---

## 9. Common Issues & Troubleshooting

### ❌ `MongoServerError: connection refused`
- **Cause:** MongoDB is not running.
- **Fix:** Start the MongoDB service:
  ```bash
  sudo systemctl start mongod
  ```

### ❌ `MongooseServerSelectionError: Could not connect to any servers`
- **Cause:** Wrong connection string or MongoDB not accessible.
- **Fix:** Check `MONGODB_URI` in `server/.env`. Ensure MongoDB is running and the URI is correct.

### ❌ `mongoimport: command not found`
- **Cause:** MongoDB Database Tools not installed separately.
- **Fix:** Install from [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/).

### ❌ `MongoServerError: bad auth`
- **Cause:** Wrong username or password in Atlas connection string.
- **Fix:** Verify credentials in Atlas → Database Access.

### ❌ Atlas: `IP not whitelisted`
- **Cause:** Your IP is not in the Atlas Network Access list.
- **Fix:** Go to Atlas → Network Access → Add your current IP or allow all (`0.0.0.0/0`).

### ❌ `E11000 duplicate key error`
- **Cause:** Trying to insert data that already exists (duplicate email, slug, etc.).
- **Fix:** Either drop the collection first or use the seed script which clears data automatically.

---

## Need Help?

If you run into any issues, check:
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
