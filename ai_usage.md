.

🤖 AI Usage in Our Project
🟣 1. Purpose of Using AI

In our project, AI is used to automate and improve the ticket management process.

Instead of manual analysis, AI helps in:

Understanding ticket content
Making intelligent decisions
Reducing human effort
🟣 2. AI Model Used
We used Gemini 3.5 Flash
It is a fast and lightweight AI model
Integrated using API

👉 It processes natural language (ticket text) and gives structured output

🟣 3. Where AI is Used (Core Functionalities)
🔹 1. Ticket Classification

AI reads the ticket description and identifies:

Domain
👉 Example: Database / Network / Application

📌 Example:

“Server not responding” → Network Issue

🔹 2. Priority Prediction

AI determines how critical the issue is:

P1 → Critical
P2 → High
P3 → Medium
P4 → Low

📌 Example:

“Production server down” → P1

🔹 3. Complexity Estimation

AI estimates effort required:

Low
Medium
High

📌 Example:

Password reset → Low
Server crash → High



🟣 4. How AI Works in Our System (Simple Flow)
User submits ticket
Ticket text sent to AI (Gemini API)
AI processes the text
Returns:
Domain
Priority
Complexity
System uses this data for:
SLA tracking
Assignment
🟣 5. Why We Used AI
Manual classification is slow
Humans can make mistakes
AI provides:
Faster processing
Better accuracy
Consistent results

🟣 7. Solution: Fallback System

To overcome AI limitations:

👉 We implemented a rule-based algorithm

Works when AI fails
Uses keyword matching
Ensures system reliability
🟣 8. Advantages of Using AI
Automation of ticket handling
Reduced manual effort
Faster response time
Improved SLA performance
Scalable system
