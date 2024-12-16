# Pawder Application Back-end Code

This is a Pawder application build with TypeScript , using Express.js Framework and Prisma to develop in MariaDB database.

> [!NOTE]
> #### **This is the manual installation of back-end code. In case you want to connect directly to our back-end api url, use `https://pawder-api.ngrok.dev`**


# Requirement
- Node version 23.3.0 or newer.


# Step to run back-end

1. Clone the repository to your files.
2. Check the .env file about the DATABASE_URL
3. Running using `npm install`
4. Generate the prisma schema to use along with all codes by run `npx prisma generate`
5. Start the back-end server by run `npm start`, (The server will run at port localhost:8000)

(If you can't connect to the database, check DATABASE_URL in .env file or contact us)
