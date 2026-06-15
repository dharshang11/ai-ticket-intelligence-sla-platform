# 🧪 Test Cases - AI Ticket Intelligence System

## 📌 Overview
This document contains the test cases used to validate the AI-powered ticket classification and SLA management system.

---

## 🎯 Objective
- Verify AI-based classification accuracy
- Validate priority prediction
- Ensure SLA assignment correctness
- Test fallback mechanism

---

## 📊 Test Case Table

| Test Case ID | Input Description | Expected Domain | Expected Priority | Expected Complexity | Actual Output | Status |
|-------------|------------------|-----------------|-------------------|---------------------|---------------|--------|
| TC001 | Production database is not responding | Database | P1 | High | Database, P1, High | Pass |
| TC002 | User unable to login | Application | P2 | Medium | Application, P2, Medium | Pass |
| TC003 | Password reset request | Support | P4 | Low | Support, P4, Low | Pass |
| TC004 | Server CPU usage is high | Infrastructure | P1 | High | Infrastructure, P1, High | Pass |
| TC005 | Email notifications not working | Application | P3 | Medium | Application, P3, Medium | Pass |
| TC006 | Network latency issue | Network | P2 | Medium | Network, P2, Medium | Pass |
| TC007 | Create new user account | Support | P4 | Low | Support, P4, Low | Pass |
| TC008 | Application crashing | Application | P1 | High | Application, P1, High | Pass |
| TC009 | Backup job failed | Database | P2 | Medium | Database, P2, Medium | Pass |
| TC010 | Printer not working | Hardware | P4 | Low | Hardware, P4, Low | Pass |

---

## ⚠️ Edge Case Testing

| Test Case ID | Input | Expected Behavior | Status |
|-------------|------|------------------|--------|
| TC011 | Empty input | Show validation error | Pass |
| TC012 | Very long text | Should classify correctly | Pass |
| TC013 | Unclear input | Assign default priority (P3) | Pass |
| TC014 | AI API failure | Trigger fallback system | Pass |

---

## 🔄 Testing Approach

### 1. AI-Based Testing
- Input: Ticket description
- Output: AI classification
- Compared with expected results

### 2. Rule-Based Testing (Fallback)
- Triggered when AI fails
- Uses keyword matching
- Ensures system reliability

---

## 📊 Conclusion

The system achieved high accuracy in classification and handled edge cases effectively.  
The fallback mechanism ensures uninterrupted operation even during AI failure.
