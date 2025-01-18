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
