import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import { colors } from "../colors";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // 👇 Scroll to top automatically when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" }); // or "smooth"
  }, [location.pathname]);

  // 👇 Show/hide scroll-to-top button based on scroll
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 50);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 👇 Manual scroll to top when button is clicked
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-5 left-5 text-black p-3 rounded-full shadow-lg transition"
          style={{
            backgroundColor: isHovered
              ? colors.primaryGreenHover
              : colors.primaryGreen,
            zIndex: 100,
            transition: "background-color 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Scroll to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;
