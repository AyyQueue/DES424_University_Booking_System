import { useEffect } from "react";

export default function useOldScript() {
  useEffect(() => {
    // Elements
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");
    const successModal = document.getElementById("successModal");
    const closeModalBtn = document.querySelector(".close-modal");
    const modalOkBtn = document.getElementById("modalOk");
    const bookButtons = document.querySelectorAll(".book-btn");

    // --------------------------
    // Mobile menu toggle
    // --------------------------
    const toggleMenu = () => {
      if (mainNav) mainNav.classList.toggle("active");
    };
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleMenu);
    }

    // Close mobile menu when clicking a link
    const handleNavLinkClick = () => {
      if (mainNav) mainNav.classList.remove("active");
    };
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach((link) => link.addEventListener("click", handleNavLinkClick));

    // --------------------------
    // Smooth scrolling
    // --------------------------
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    };
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick));

    // --------------------------
    // Modal functionality
    // --------------------------
    const openModal = () => {
      if (successModal) {
        successModal.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling
      }
    };

    const closeModal = () => {
      if (successModal) {
        successModal.classList.remove("active");
        document.body.style.overflow = "auto"; // Re-enable scrolling
      }
    };

    // Show modal when booking a room
    bookButtons.forEach((button) => button.addEventListener("click", openModal));

    // Close modal buttons
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modalOkBtn) modalOkBtn.addEventListener("click", closeModal);

    // Close modal when clicking outside modal content
    if (successModal) {
      successModal.addEventListener("click", (e) => {
        if (e.target === successModal) closeModal();
      });
    }

    // Close modal with Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape" && successModal && successModal.classList.contains("active")) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);

    // --------------------------
    // Cleanup to prevent double listeners
    // --------------------------
    return () => {
      if (mobileMenuBtn) mobileMenuBtn.removeEventListener("click", toggleMenu);
      navLinks.forEach((link) => link.removeEventListener("click", handleNavLinkClick));
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick));
      bookButtons.forEach((button) => button.removeEventListener("click", openModal));
      if (closeModalBtn) closeModalBtn.removeEventListener("click", closeModal);
      if (modalOkBtn) modalOkBtn.removeEventListener("click", closeModal);
      if (successModal) {
        successModal.removeEventListener("click", (e) => {
          if (e.target === successModal) closeModal();
        });
      }
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
}
