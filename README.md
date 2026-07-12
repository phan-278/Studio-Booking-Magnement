# 📖 1. Description
**Studio Booking Management** is a comprehensive web-based platform designed for studio owners and customers. It streamlines the process of booking studio rooms, managing equipment rentals, tracking customer information, and generating business reports, all within an intuitive and responsive user interface.

# 🏷️ 2. Badges/Tags
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

# 🚀 3. Intro
Welcome to the Studio Booking Management project! This project was built as part of the "Software Engineering" (Nhập môn Công nghệ phần mềm) course. It aims to provide a complete solution for managing physical studio spaces, allowing managers to efficiently handle reservations, assign equipment, track revenue, and organize staff schedules through a modern web application.

# 📂 4. Project Structure
```text
Studio-Booking-Management/
├── 📁 backend/                # Server-side logic and APIs (Node.js)
│   ├── 📁 src/                # Controllers, models, and routes
│   ├── 📄 package.json        # Backend dependencies
│   └── 📄 .env                # Environment variables
├── 📁 frontend/               # Client-side web application
│   ├── 📁 assets/             # Static assets (images, icons, global styles)
│   ├── 📁 components/         # Reusable UI components (sidebar, header, etc.)
│   ├── 📁 features/           # Feature-specific modules (bookings, equipment, reports)
│   ├── 📁 services/           # API integration and data fetching
│   ├── 📁 utils/              # Helper utility functions
│   ├── 📄 index.html          # Main entry HTML file
│   ├── 📄 vite.config.js      # Vite build configuration
│   └── 📄 package.json        # Frontend dependencies
└── 📄 README.md               # Project documentation
```

# 💻 5. Technologies
- **Frontend:** 🌐 HTML5, CSS3, JavaScript (Vanilla/ES6+), bundled with Vite.
- **Backend:** ⚙️ Node.js, Express.js (or similar framework).
- **Database:** 🗄️ Relational Database (MySQL / PostgreSQL).
- **Testing:** 🧪 Jest (Backend testing).

# ✨ 6. Features
- **Booking Management:** Create, view, approve, and cancel studio room reservations.
- **Equipment Tracking:** Manage studio equipment inventory, availability, and rentals alongside room bookings.
- **Dynamic Dashboard:** Visualize daily bookings, revenue statistics, and system overview.
- **Reporting System:** Generate structured reports for business analytics.
- **Responsive UI:** A dynamic and modular frontend utilizing component-based architecture for smooth navigation.

# ⌨️ 7. Keyboard Shortcuts
- *Depending on the implemented UI, standard browser shortcuts apply (e.g., Tab for form navigation).*

# ⚙️ 8. The Process
Building this system involved significant architectural challenges. One major challenge was implementing a clean separation of concerns using Vanilla JavaScript, dynamically loading UI components like sidebars and headers without a heavy frontend framework like React. On the backend, ensuring data integrity during concurrent booking requests required careful database schema design and validation logic.

# 🧠 9. What I Learned
Through this project, I gained hands-on experience with:
- 🏗️ Designing and implementing RESTful APIs.
- 🧩 Structuring a modular, component-based frontend using Vanilla JS and Vite.
- 🗃️ Designing relational database schemas for complex real-world relationships (Users, Bookings, Equipment, Invoices).
- 🧪 Writing unit tests (Jest) to ensure backend reliability.
- 🚀 Setting up project build tools and environment configurations.

# 🚀 10. How to Improve
In the future, I plan to expand the system by adding **Payment Gateway Integration** (e.g., VNPay, MoMo, Stripe) to allow customers to pay deposits online. Additionally, I want to implement **Automated Email/SMS Notifications** to remind customers of their upcoming studio sessions.

# 🛠️ 11. How to Run
1. **Clone the repository:**
   ```bash
   git clone https://github.com/phan-278/Studio-Booking-Management
   cd Studio-Booking-Management
   ```
2. **Setup the Database:**
   Ensure your local database server (e.g., MySQL via XAMPP) is running. Import the schema files located in the `database/` folder.
3. **Configure Environment Variables:**
   Update the `.env` files in both the `frontend/` and `backend/` directories with your local credentials.
4. **Run the application:**
   You will need to run the frontend and backend simultaneously. Open two separate terminal windows:

   **Terminal 1: Start Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

   **Terminal 2: Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

