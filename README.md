# NoteMind BackEnd API
**NoteMind** is a high-performance, AI-driven educational platform backend. It uses **Groq's LPU™ (Language Processing Unit)** technology and the **Llama 3.3 70B** model to generate structured study notes, summaries, and educational content with near-instant latency.

### Live Demo
Check out the live API here: 

## Tech Stack
* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js (v5)
* **Database:** MongoDB (via Mongoose)
* **AI Engine:** Groq Cloud API (Model: `llama-3.3-70b-versatile`)
* **Authentication:** JWT (Access & Refresh Tokens) 
* **File Storage:** Cloudinary 
* **Emailing:** Nodemailer

## AI Features (Powered by Llama 3.3)

This backend is optimized for the **Llama 3.3 70B** model, which allows:

* **Speed:** Token generation at 300+ tokens per second.
* **Structured Output:** Generates notes directly in HTML format for seamless frontend rendering.
* **Accuracy:** Advanced reasoning for complex subjects like Economics, Science, and Math.


## Security & Optimization

* **BcryptJS:** For secure password hashing.
* **Refresh Tokens:** Secure token rotation to keep users logged in safely.
* **Multer Memory Storage:** Files are buffered in RAM and streamed to Cloudinary for efficiency.