# RankMyWriting - Backend

RankMyWriting is a web app where users can upload their writings, receive votes and scores on them, and vote on other people's writings. This repository contains the **backend** of the application, built using **Node.js** and **Express**, with data stored in **MongoDB**.

The backend handles user authentication, managing writings, storing votes, and scoring submissions. It provides APIs that the frontend interacts with to display and manage user data and writings.

For a quick overview of how the app works, check out this [video demo](https://youtu.be/Owe9Kdfzhw8).

## Features

-   **User Authentication**: Users can register, log in, and receive a JWT token for secure access.
-   **Writing Management**: Users can upload their written texts and retrieve them from the database.
-   **Voting System**: Users can vote on writings and the system tracks the votes to generate scores.
-   **JWT Authentication**: Secure routes require authentication via a JWT token.
-   **Database Integration**: MongoDB is used to store user data, writings, and votes.

## Requirements

-   Node.js version: **v16.20.2**
    -   This app is developed to work with Node.js version `v16.20.2`. It may not work properly with newer versions of Node.js due to potential compatibility issues.
-   MongoDB: A MongoDB database instance should be available for data storage.

## Environment Variables

Before running the app, ensure the following environment variables are set:

-   **DB_CONNECTION_STRING**: MongoDB connection string for connecting to the database.
-   **PORT**: The port on which the backend server will run (default is `5000`).
-   **JWT_SECRET**: A secret key used to sign and verify JWT tokens.
-   **JWT_EXPIRE**: The expiration time for JWT tokens (e.g., `1h` for one hour).

You can create a `.env` file in the root directory to store these variables.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adevk/RankMyWriting-Backend.git
   cd RankMyWriting-Backend

2. Install dependencies:

	```bash
	npm install

## Running the App

To start the development server, use the following command:

	npm run start
