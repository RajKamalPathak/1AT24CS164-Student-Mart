import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="app-layout-root">
      <Sidebar />
      <div className="main-viewport-wrapper">
        {/* Top Campus Announcement Bar */}
        <div className="campus-ticker-bar">
          <div className="ticker-content">
            <span className="ticker-tag">CAMPUS NOTICE</span>
            <span className="ticker-text">
              Mid-term exam stationery kits, scientific calculators, & lab aprons in stock with hostel delivery!
            </span>
            <span className="ticker-highlight">Orders ₹299+ deliver free to all hostel blocks</span>
          </div>
        </div>

        {/* Content Area */}
        <main className="content-container">
          <Outlet />
        </main>

        {/* College Project Footer */}
        <footer className="student-mart-footer">
          <div className="footer-content">
            <div className="footer-left">
              <strong>Student Mart</strong> — Academic Stationery & Dorm Essentials
              <span className="footer-divider">•</span>
              <span>Full-Stack MERN Architecture</span>
            </div>
            <div className="footer-right">
              <span>Database: <code>MongoDB (student_mart)</code></span>
              <span className="footer-divider">•</span>
              <span>Express API: <code>/api</code></span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
