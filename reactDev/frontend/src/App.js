import { useState } from "react";
import SignInButton from "./components/SignInButton.js";
import SignUpButton from "./components/SignUpButton.js";
import useOldScript from "./script.js";

function App() {
  const [user, setUser] = useState(null);
  useOldScript();

  return (
    <div>
      {/* header */}
      <header>
        <div className="header-container">
          <div className="logo">
            <i className="fas fa-door-open"></i>
            <span>SIITRoomBook</span>
          </div>
          <button className="mobile-menu-btn" id="mobileMenuBtn">
            <i className="fas fa-bars"></i>
          </button>
          <nav id="mainNav">
            <ul>
              <li><a href="./index.html" className="active">Home</a></li>
              <li><a href="#rooms">Rooms</a></li>
              <li><SignUpButton user={user} setUser={setUser}/></li> {/* Should be visible when signed out-->*/}
              <li><SignInButton user={user} setUser={setUser}/></li> {/* Should be visible when signed in */}
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

      {/* Rooms Section */}
      <section id="rooms">
        <div className="container">
          <h2 className="section-title">Available Rooms</h2>
          <div className="rooms-grid">
            {/* Room 1 */}
            <div className="room-card">
              <div className="room-image" style={{backgroundImage: "url('./img/room1.jpg')"}}></div>
              <div className="room-info">
                <h3>Main Lecture Hall A</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 150 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">Projector</span>
                  <span className="room-feature">Audio System</span>
                  <span className="room-feature">Wheelchair Access</span>
                </div>
                <span className="room-status available">Available</span>
                <button className="btn book-btn" style={{width: "100%", marginTop: "1rem"}}
                  data-room="Main Lecture Hall A">Book Now</button>
              </div>
            </div>

            {/* Room 2 */}
            <div className="room-card">
              <div className="room-image"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"}}>
              </div>
              <div className="room-info">
                <h3>Science Building Room 101</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 50 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">Lab Equipment</span>
                  <span className="room-feature">Projector</span>
                  <span className="room-feature">Whiteboard</span>
                </div>
                <span className="room-status available">Available</span>
                <button className="btn book-btn" style={{width: "100%", marginTop: "1rem"}}
                  data-room="Science Building Room 101">Book Now</button>
              </div>
            </div>

            {/* Room 3 */}
            <div className="room-card">
              <div className="room-image"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"}}>
              </div>
              <div className="room-info">
                <h3>Library Study Room 1</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 8 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">Quiet Zone</span>
                  <span className="room-feature">Whiteboard</span>
                  <span className="room-feature">Power Outlets</span>
                </div>
                <span className="room-status booked">Booked Until 3 PM</span>
                <button className="btn" style={{width: "100%", marginTop: "1rem"}} disabled>Currently Booked</button>
              </div>
            </div>

            {/* Room 4 */}
            <div className="room-card">
              <div className="room-image"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"}}>
              </div>
              <div className="room-info">
                <h3>Conference Room B</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 20 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">Video Conferencing</span>
                  <span className="room-feature">Projector</span>
                  <span className="room-feature">Catering Available</span>
                </div>
                <span className="room-status available">Available</span>
                <button className="btn book-btn" style={{width: "100%", marginTop: "1rem"}}
                  data-room="Conference Room B">Book Now</button>
              </div>
            </div>

            {/* Room 5 */}
            <div className="room-card">
              <div className="room-image"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"}}>
              </div>
              <div className="room-info">
                <h3>Arts Building Studio</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 30 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">Natural Light</span>
                  <span className="room-feature">Art Supplies</span>
                  <span className="room-feature">Flexible Seating</span>
                </div>
                <span className="room-status available">Available</span>
                <button className="btn book-btn" style={{width: "100%", marginTop: "1rem"}}
                  data-room="Arts Building Studio">Book Now</button>
              </div>
            </div>

            {/* Room 6 */}
            <div className="room-card">
              <div className="room-image"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"}}>
              </div>
              <div className="room-info">
                <h3>Computer Lab 3</h3>
                <div className="room-capacity">
                  <i className="fas fa-users"></i>
                  <span>Capacity: 40 people</span>
                </div>
                <div className="room-features">
                  <span className="room-feature">30 Computers</span>
                  <span className="room-feature">Projector</span>
                  <span className="room-feature">Software Suite</span>
                </div>
                <span className="room-status booked">Booked</span>
                <button className="btn" style={{width: "100%", marginTop: "1rem"}} disabled>Currently Booked</button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <li><i className="fas fa-map-marker-alt"></i> Thamasat University, ragsit campus</li>
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

      <script src="script.js"></script>
    </div>
  );
}

export default App;

