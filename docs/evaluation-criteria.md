# Evaluation Criteria

# AI-Powered Support Ticket Triage Tool

---

# Overview

The success of the AI-Powered Support Ticket Triage Tool will be evaluated using technical, functional, and AI-specific performance metrics. These evaluation criteria help measure the accuracy, efficiency, reliability, and overall effectiveness of the system.

---

# Evaluation Metrics

## 1. Ticket Classification Accuracy

### Description

Measures how accurately the AI model classifies support tickets into the correct category.

### Target

**≥ 90% Accuracy**

### Evaluation Method

- Compare AI predictions with manually labeled tickets.
- Calculate the percentage of correctly classified tickets.

---

## 2. Ticket Summary Quality

### Description

Measures whether the AI-generated summary correctly captures the customer's issue.

### Target

- Clear
- Concise
- Easy to understand

### Evaluation Method

Human review of randomly selected ticket summaries.

---

## 3. Priority Detection Accuracy

### Description

Evaluates whether the system correctly identifies ticket urgency.

Priority Levels

- High
- Medium
- Low

### Target

**≥ 85% Accuracy**

### Evaluation Method

Compare AI-generated priorities with expected priorities.

---

## 4. Ticket Routing Accuracy

### Description

Measures whether tickets are assigned to the correct support department.

### Departments

- Technical Support
- Billing
- Account Management
- Customer Support

### Target

**≥ 90% Correct Routing**

---

## 5. API Response Time

### Description

Measures how quickly the system processes a request.

### Target

Less than **3 seconds** per ticket.

---

## 6. API Availability

### Description

Measures how consistently the API remains operational.

### Target

Greater than **99% uptime** during testing.

---

## 7. Error Handling

### Description

Measures how well the application handles invalid or unexpected input.

### Success Criteria

- No application crashes
- Meaningful error messages
- Proper exception handling

---

## 8. Logging

### Description

Ensure important events are recorded.

Examples

- API requests
- API failures
- Retry attempts
- Invalid inputs

### Success Criteria

All important events are logged successfully.

---

## 9. Docker Deployment

### Description

Evaluate whether the application can be deployed successfully using Docker.

### Success Criteria

- Docker image builds successfully.
- Container starts without errors.
- API endpoints are accessible.

---

# Sample Evaluation Dataset

| Ticket | Expected Category |
|---------|-------------------|
| Payment failed after transaction | Billing |
| Unable to login to account | Account Management |
| Application crashes while opening | Technical Support |
| Request for refund | Billing |
| Need help updating profile | Account Management |
| Feature request for dark mode | General Inquiry |
| Password reset required | Account Management |
| Server error while uploading files | Technical Support |

---

# Performance Metrics Summary

| Metric | Target |
|---------|---------|
| Classification Accuracy | ≥ 90% |
| Routing Accuracy | ≥ 90% |
| Priority Detection | ≥ 85% |
| API Response Time | < 3 Seconds |
| API Availability | > 99% |
| Error Handling | No Crashes |
| Docker Deployment | Successful |
| Logging | Enabled |

---

# Acceptance Criteria

The project will be considered successful if:

- The AI correctly classifies most support tickets.
- Ticket summaries accurately represent customer issues.
- Tickets are routed to the correct support team.
- API responses remain fast and reliable.
- Docker deployment works successfully.
- The application handles invalid inputs gracefully.
- Logging captures all important events.

---

# Future Evaluation

Future versions of the project can also be evaluated using:

- Customer Satisfaction Score (CSAT)
- Ticket Resolution Time
- Precision & Recall
- F1 Score
- AI Confidence Score
- User Feedback
- Cost per API Request