# Reportwise

Reportwise is a web-based application designed to analyze and generate reports from uploaded PDFs. It leverages advanced AI models and cloud infrastructure to ensure seamless and accurate document processing.

---

## Project Structure

```
root/
├── Backend
├── Frontend
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_name>
```

---

### 2. Backend Setup

1. Navigate to the `Backend` directory:

   ```bash
   cd Backend
   ```

2. Set up the `.env` file with the following variables:

   ```env
   AZURE_OPENAI_KEY=
   AZURE_OPENAI_ENDPOINT=
   AZURE_OPENAI_ASSISTANT_ID
   MONGODB_URI=
   CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   UPLOADTHING_TOKEN= ##Creat an APP on [uploadthing](https://uploadthing.com/) platform to get this token 
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the backend server:

   ```bash
   npm run start
   ```

---

### 3. Frontend Setup

1. Navigate to the `Frontend` directory:

   ```bash
   cd Frontend
   ```

2. Set up the `.env` file with the following variables:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=
   VITE_API_URL= <your_backend_url>
   VITE_WS_URL= <your_websocket_url> eg. wss://your_backend.com
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

---

## Deployment Instructions

### Backend Deployment

1. Deploy the backend on [Render](https://render.com):

   1. Create a new Web Service project on Render.
   2. Connect the repository.
   3. Select `./pdf_analyzer/Backend` as the Root Directory.
   4. Set the Build Command:

      ```bash
      npm install
      ```

   5. Set the Start Command:

      ```bash
      npm run start
      ```

   6. Add the required environment variables from your `.env` file.
   7. Deploy the service and note down its URL.

### Frontend Deployment

1. Deploy the frontend on [Vercel](https://vercel.com):

   1. Create a new project on Vercel.
   2. Select the `/Frontend` folder of the repository.
   3. Add the required environment variables mentioned above.

   **NOTE**: Remember to set these two env variables correctly

      ```env
      VITE_API_URL=<your_backend_url> # e.g., https://your_backend.com
      VITE_WS_URL=<your_websocket_url> # e.g., wss://your_backend.com
      ```

   4. Deploy the project.
   5. Test the application to ensure everything is working correctly.

---
