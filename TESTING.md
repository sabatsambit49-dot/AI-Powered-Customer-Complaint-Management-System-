# Testing Guide: AI-Powered Customer Complaint Management System

This document outlines how to execute backend unit/integration tests and frontend build checks.

---

## 1. Backend Testing (Pytest)

The backend uses `pytest` and `httpx` to test document parsing, LangGraph state graph node transitions, and FastAPI REST endpoints.

### Setup Test Environment
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Run Tests
```bash
pytest -v tests/
```

### Tested Components
1. `tests/test_parser.py`: Verifies raw text extraction from plain text and EML email files.
2. `tests/test_graph_nodes.py`: Verifies `ingest_node`, `completeness_checker_node`, and `duplicate_detection_node` logic.
3. `tests/test_api_routes.py`: Verifies `/api/health`, `/api/complaints`, `/api/complaints/{id}`, and complaint creation endpoints.

---

## 2. Frontend Build Verification

To verify that the React + Redux Toolkit application compiles cleanly without syntax or bundling errors:

```bash
cd frontend
npm install
npm run build
```
The output bundle will be generated in `frontend/dist/`.

---

## 3. End-to-End Integration Verification

1. Start PostgreSQL via Docker:
   ```bash
   docker-compose up postgres -d
   ```
2. Start FastAPI Backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
3. Start Frontend Dev Server:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open `http://localhost:5173`, click on a sample data preset (e.g., Injectable Particulate), and click **Run AI Extraction & Triage Pipeline**.
