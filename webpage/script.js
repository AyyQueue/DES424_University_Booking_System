// Mobile menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('mainNav').classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function () {
        document.getElementById('mainNav').classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Modal functionality
const successModal = document.getElementById('successModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalOkBtn = document.getElementById('modalOk');
const bookButtons = document.querySelectorAll('.book-btn');

// Show modal when booking a room
bookButtons.forEach(button => {
    button.addEventListener('click', function () {
        const roomName = this.getAttribute('data-room');
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

// Close modal with X button
closeModalBtn.addEventListener('click', function () {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
});

// Close modal with OK button
modalOkBtn.addEventListener('click', function () {
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
});

// Close modal when clicking outside the modal content
successModal.addEventListener('click', function (e) {
    if (e.target === successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
        successModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
});