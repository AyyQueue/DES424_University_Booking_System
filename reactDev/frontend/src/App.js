import { useState } from "react";
import SignInButton from "./components/SignInButton.js";
import SignUpButton from "./components/SignUpButton.js";
import useOldScript from "./script.js";
import SignInModal from "./components/SignInModal.js";
import SignUpModal from "./components/SignUpModal.js";
import RoomsSection from "./components/RoomsSection.js";
import ViewBookBTN from "./components/ViewBookBTN.js";
import BookingsModal from "./components/BookingsModal.js"; 

function App() {
  const [signInModalActive, setSignInModalActive] = useState(false);
  const [signUpModalActive, setSignUpModalActive] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookings, setBookings] = useState([]); 
  useOldScript();

  return (
    <div>
      {/* header */}
      <header>
        <div className="header-container">
          <div className="logo">
            <i className="fas fa-door-open"></i>
            <span>UniRoomBook</span>
          </div>
          <button className="mobile-menu-btn" id="mobileMenuBtn">
            <i className="fas fa-bars"></i>
          </button>
          <nav id="mainNav">
            <ul>
              <li><a href="./index.html" className="active">Home</a></li>
              <li><a href="#rooms">Rooms</a></li>
              <li><ViewBookBTN setBookings={setBookings} setShowModal={setShowBookingsModal}/></li> {/* Needs to be visible only when logged in */}
              <li><SignUpButton setSignUpModalActive={setSignUpModalActive}/></li> {/* Should be visible when signed out-->*/}
              <li><SignInButton setSignInModalActive={setSignInModalActive}/></li> {/* Should be visible when signed in */}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>University Room Booking Made Simple</h1>
          <p>Easily reserve lecture halls, study rooms, and meeting spaces across campus with our intuitive booking
            system.</p>
          <a href="#rooms" className="btn btn-large">Explore Available Rooms</a>
        </div>
      </section>

      
      <RoomsSection/>

      {/* footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-column">
            <h3>UniRoomBook</h3>
            <p>The easiest way to book rooms across campus. Designed for students, faculty, and staff.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#rooms">Available Rooms</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#">My Bookings</a></li>
              <li><a href="#">Help & Support</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-links">
              <li><i className="fas fa-map-marker-alt"></i> Thammasat University, Rangsit Campus</li>
              <li><i className="fas fa-phone"></i> 123-456-7890</li>
              <li><i className="fas fa-envelope"></i> Cloudbase@gmail.com</li>
              <li><i className="fas fa-clock"></i> Mon-Fri: 8AM-6PM</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; Cloud base Project: University Room Booking System</p>
        </div>
      </footer>

      <div className="modal" id="successModal">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Booking Confirmed</h3>
            <button className="close-modal">&times;</button>
          </div>
          <div className="modal-body">
            <p>Your room booking has been successfully confirmed!</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" id="modalOk">OK</button>
          </div>
        </div>
      </div>

      <SignInModal setSignInModalActive={setSignInModalActive} signInModalActive={signInModalActive}/>
      <SignUpModal setSignUpModalActive={setSignUpModalActive} signUpModalActive={signUpModalActive}/>
      <BookingsModal show={showBookingsModal} onClose={() => setShowBookingsModal(false)} bookings={bookings} setBookings={setBookings}/>

      <script src="script.js"></script>
    </div>
  );
}

export default App;

