FROM python:3.11-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY backend/ .

# Railway provides the PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
