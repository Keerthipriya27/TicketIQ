# TicketIQ QA Report

1. Project Overview

TicketIQ is a FastAPI application that exposes endpoints for AI-driven support ticket triage. Key endpoints: `/`, `/health`, `/analyze`.

2. Testing Environment

- OS: Linux / Windows (CI uses ubuntu-latest)
- Python: 3.11
- Tools: pytest, TestClient, Docker

3. API Testing Results

- Root `/` : PASS
- Health `/health` : PASS
- Analyze `/analyze` : PASS (mocked responses in automated tests)

4. Automated Testing Results

- Tests: `pytest` - All tests pass locally for the mocked AI client.


5. Test Cases

Test Case ID: TC001
Endpoint: `/` 
Method: GET
Input: None
Expected Result: 200, {"message":"TicketIQ API Running"}
Actual Result: 200, {"message":"TicketIQ API Running"}
Status: PASS

Test Case ID: TC002
Endpoint: `/health` 
Method: GET
Input: None
Expected Result: 200, {"status":"healthy"}
Actual Result: 200, {"status":"healthy"}
Status: PASS

Test Case ID: TC003
Endpoint: `/analyze` 
Method: POST
Input: {"ticket":"My app crashes on startup"}
Expected Result: 200, JSON with keys [summary, category, priority, assigned_team]
Actual Result: 200, JSON with expected keys (mocked response)
Status: PASS

Test Case ID: TC004
Endpoint: `/analyze` 
Method: POST
Input: {"ticket":""} (empty string)
Expected Result: 200 or validation error depending on input rules
Actual Result: 200 (mocked response)
Status: PASS

Test Case ID: TC005
Endpoint: `/analyze` 
Method: POST
Input: {} (missing `ticket`)
Expected Result: 422 Unprocessable Entity
Actual Result: 422
Status: PASS

Test Case ID: TC006
Endpoint: `/analyze` 
Method: POST
Input: invalid JSON body
Expected Result: 400 or 422
Actual Result: 400/422
Status: PASS

Test Case ID: TC007
Endpoint: `/analyze` 
Method: POST
Input: {"ticket":"error case"} with client raising exception
Expected Result: Exception propagated / 500
Actual Result: RuntimeError propagated in test environment
Status: PASS (behavior observed)


6. Performance Testing Metrics

Performance tests were not run automatically. Use `ab` or `locust` to run against the running Docker container and record metrics here.

7. Docker Deployment Verification

- `docker compose up --build` should start the service on port 8000. Ensure `GROQ_API_KEY` is provided for real AI calls.

8. CI/CD Pipeline Verification

- GitHub Actions workflow `ci.yml` runs tests and basic compile checks on push/PR.

9. Known Issues

- If `groq` package is not installed or `GROQ_API_KEY` is not set, the `/analyze` endpoint will raise a runtime error. Tests mock the client to avoid external calls.

10. Final QA Status

Automated tests and CI configured; basic Docker and Postman artifacts added. Manual performance testing recommended before production.
