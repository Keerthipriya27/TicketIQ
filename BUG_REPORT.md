# Bug ID 001

## Description:
Missing or misconfigured Groq client may cause import/runtime errors when the environment is not configured.

## Steps To Reproduce:
1. Do not install `groq` package.
2. Do not set `GROQ_API_KEY` environment variable.
3. Start the application and call `/analyze`.

## Expected Behavior:
Application should handle missing configuration gracefully and return a clear error message.

## Actual Behavior:
The Groq client is not available; import or runtime error occurs unless code handles it.

## Root Cause:
Direct import and instantiation of Groq at module import time.

## Solution:
Implemented a defensive import pattern in `api/routes.py` to avoid import failures during tests and CI. Recommend adding clearer runtime error handling and health checks.

## Status:
Fixed (defensive import added). Verify in staging.

If no other bugs are found: "No critical bugs found during testing."
