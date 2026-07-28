# Day 6 – AI-Powered Support Ticket Triage Tool

## Task

Planned and designed an AI-powered Support Ticket Triage Tool capable of automatically classifying, summarizing, prioritizing, and routing customer support tickets. Prepared the complete project architecture, technical design, risk assessment, evaluation criteria, and project roadmap before beginning implementation.

---

## Objective

The objective of this project is to reduce the manual effort involved in handling customer support tickets by using Artificial Intelligence to automatically analyze incoming tickets and assign them to the appropriate support team.

---

## Proposed Features

- Automatic Ticket Classification
- AI-generated Ticket Summary
- Priority Detection (High / Medium / Low)
- Automatic Ticket Routing
- REST API using FastAPI
- Logging & Monitoring
- Docker Deployment
- Performance Evaluation

---

## Tech Stack

- Python
- FastAPI
- Groq LLM API
- Pandas
- Requests
- Docker
- Git & GitHub
- VS Code

---

## Project Structure

cred_Day6/

├── docs/
├── data/
├── models/
├── api/
├── tests/
├── outputs/
├── README.md
├── app.py
├── requirements.txt


---

## Deliverables

- Project Specification
- Architecture Design
- Risk Assessment
- Evaluation Criteria
- Task Board
- Repository Skeleton
- Initial FastAPI Application

---

## Repository

Repository:
https://github.com/Keerthipriya27/CRED_INTERN

---

## Outcome

Successfully completed the project planning phase by defining the scope, architecture, technical risks, evaluation metrics, and implementation roadmap for the AI-powered Support Ticket Triage Tool.

---

## Running Locally

Prerequisites:

- Python 3.11
- (Optional) `GROQ_API_KEY` environment variable for real AI calls

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the app:

```bash
uvicorn app:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for Swagger UI.

## Running with Docker

Build and run with docker-compose:

```bash
docker compose up --build
```

Ensure `GROQ_API_KEY` is set in your environment if you want `/analyze` to call the real AI.

## Running tests

Run the automated test suite:

```bash
pytest
```

## CI/CD

A GitHub Actions workflow is included at `.github/workflows/ci.yml` which runs on every push and pull request. It installs dependencies and runs the test suite.
