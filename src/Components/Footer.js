import { Link, useLocation } from "react-router-dom";
import logo from "../images/tvpLogo.png";
import { useState } from "react";
import { colors } from "../colors";
import card from "../images/cards.png";
import Halal from "../images/Halal.png";

const Footer = () => {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isTermsHovered, setIsTermsHovered] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage(""); // Clear the input field after sending
    }
  };

  return (
    <footer
      className=" text-white text-center py-8 grid grid-cols-2 lg:grid-cols-7 mt-5 mb-16 lg:mb-0"
      style={{
        width: isActive("/") && window.innerWidth > 768 ? "75%" : "100%",
        backgroundColor: colors.primaryRed,
      }}
    >
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 lg:w-2/3 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2
                style={{ color: colors.primaryRed }}
                className="text-lg lg:text-xl font-bold "
              >
                Terms and Conditions{" "}
              </h2>
              <button
                onClick={() => setShowTerms(false)}
                className=" font-bold text-xl"
                style={{
                  color: colors.primaryRed,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = colors.primaryGreen)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = colors.primaryRed)
                }
              >
                &times;
              </button>
            </div>
            <div
              className="text-sm lg:text-base text-black space-y-4"
              style={{ fontFamily: "Bambino" }}
            >
              <p style={{ textAlign: "start" }}>
                <strong>Effective Date:</strong> 22/06/2025
              </p>
              <p style={{ textAlign: "start" }}>
                Welcome to The Village Pizzeria
                (https://the-village-pizzeria.web.app/). By accessing or using
                our website, you agree to be bound by these Terms and
                Conditions. Please read them carefully.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>1. General: </strong>
                This website is operated by The Village Pizzeria, a food
                delivery service based in the United Kingdom. We offer online
                ordering for takeaway and delivery of food items.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>2. User Accounts: </strong>
                Customers may place orders as guests or by creating an account.
                You are responsible for keeping your login details secure and
                for all activity under your account.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>3. Orders: </strong>
                Once an order is placed, you will receive confirmation via
                email. We reserve the right to refuse or cancel any order at our
                discretion (e.g., due to item unavailability or technical
                error).
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>4. Payments: </strong>
                We accept secure payments by credit and debit card via Stripe.
                All payments must be made at the time of ordering.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>5. Refunds and Cancellations: </strong>
                Customers may request a refund or cancel an order before it has
                been prepared. Please contact us immediately after placing your
                order if you need to make a change.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>6. Pricing and Availability: </strong>
                All prices are listed in GBP (£) and may change without prior
                notice. Availability of menu items may vary by time and
                location.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>7. Delivery & Collection: </strong>
                Estimated delivery times are provided as a guideline. We aim to
                deliver within a reasonable time frame but cannot guarantee
                exact delivery times.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>8. Data Usage: </strong>
                By using our service, you consent to us collecting and storing
                your name, phone number, email, and address to process your
                order, send updates, and provide promotional offers. See our
                Privacy Policy for more details.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>9. Intellectual Property: </strong>
                All content on this website (text, images, logos, etc.) is the
                property of The Village Pizzeria. Use of any material without
                permission is prohibited.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>10. Limitation of Liability: </strong>
                We shall not be liable for any indirect, incidental, or
                consequential damages related to your use of our website or
                services.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>11. Governing Law: </strong>
                These Terms are governed by the laws of England and Wales.
              </p>
              <p style={{ textAlign: "start" }}>
                <strong>12. Allergies:</strong> Our food may contain or come
                into contact with common allergens, including but not limited to
                dairy, eggs, wheat, soybeans, nuts, and shellfish. If you have a
                food allergy or special dietary requirement, please inform us
                before placing your order. We cannot guarantee that any item is
                completely free of allergens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="text-2xl font-bold flex justify-center align-middle col-span-2">
        <img className="h-16 lg:h-32 w-auto" src={logo} alt="Logo" />
      </div>

      {/* Navigation Links */}
      <div className="col-span-2 lg:col-span-3">
        <div className="flex justify-center space-x-4 lg:space-x-6  mt-4 ">
          <Link
            to="/"
            className="my-3 py-1 px-3 lg:px-6 lg:px-8 text-xxs lg:text-sm lg:text-md"
            style={
              isActive("/")
                ? {
                  fontFamily: "Bambino",
                  fontWeight: 750,
                  textDecoration: "underline",
                  textDecorationColor: colors.primaryGreen,
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "5px",
                }
                : { fontFamily: "Bambino", fontWeight: 750 }
            }
          >
            MENU
          </Link>

          <Link
            to="/contact"
            className="my-3 py-1 px-3 lg:px-6 lg:px-8 text-xxs lg:text-sm lg:text-md"
            style={
              isActive("/contact")
                ? {
                  fontFamily: "Bambino",
                  fontWeight: 750,
                  textDecoration: "underline",
                  textDecorationColor: colors.primaryGreen,
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "5px",
                }
                : { fontFamily: "Bambino", fontWeight: 750 }
            }
          >
            CONTACT
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="https://www.instagram.com/thevillagepizzeria.official?igsh=MWo1ODVzbzhoeDNiag=="
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-6 h-6  transition duration-300 mr-4 ml-4 lg:mr-8 lg:ml-8 "
              style={{ fill: "#000000" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.fill = colors.primaryGreen)
              }
              onMouseLeave={(e) => (e.currentTarget.style.fill = "#000000")}
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.416.407a4.92 4.92 0 0 1 1.68 1.094c.486.487.85 1.047 1.094 1.68.167.446.353 1.246.407 2.416.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.407 2.416a4.92 4.92 0 0 1-1.094 1.68c-.487.486-1.047.85-1.68 1.094-.446.167-1.246.353-2.416.407-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.416-.407a4.92 4.92 0 0 1-1.68-1.094c-.486-.487-.85-1.047-1.094-1.68-.167-.446-.353-1.246-.407-2.416-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.407-2.416a4.92 4.92 0 0 1 1.094-1.68c.487-.486 1.047-.85 1.68-1.094.446-.167 1.246-.353 2.416-.407C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.332.013 7.05.072 5.77.13 4.885.313 4.155.595 3.315.903 2.672 1.347 2.03 1.99c-.642.643-1.087 1.285-1.395 2.125-.282.73-.465 1.615-.523 2.895C.013 8.332 0 8.74 0 12s.013 3.668.072 4.95c.058 1.28.241 2.165.523 2.895.308.84.753 1.482 1.395 2.125.642.642 1.285 1.087 2.125 1.395.73.282 1.615.465 2.895.523C8.332 23.987 8.74 24 12 24s3.668-.013 4.95-.072c1.28-.058 2.165-.241 2.895-.523.84-.308 1.482-.753 2.125-1.395.642-.642 1.087-1.285 1.395-2.125.282-.73.465-1.615.523-2.895C23.987 15.668 24 15.26 24 12s-.013-3.668-.072-4.95c-.058-1.28-.241-2.165-.523-2.895-.308-.84-.753-1.482-1.395-2.125-.642-.642-1.285-1.087-2.125-1.395-.73-.282-1.615-.465-2.895-.523C15.668.013 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zm0 10.162a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-10.845a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88z" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xxxs lg:text-sm mt-4">
          &copy; Powered by Surge . All rights reserved.
        </div>
      </div>
      {/* Instant Message Input */}
      <div className="col-span-2 flex flex-col items-middle lg:items-start justify-center space-y-2">
        <div
          className="mt-4 lg:mt-0 text-sm lg:text-base"
          style={{
            fontFamily: "Bambino",
            fontWeight: 750,
          }}
        >
          CONTACT NOW!
        </div>
        <div className="flex items-middle lg:items-start justify-center lg:justify-start w-full">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-3/4 p-1 text-black rounded-md text-sm lg:text-base"
          />
          <button
            onClick={handleSendMessage}
            onMouseEnter={() => setIsSendHovered(true)}
            onMouseLeave={() => setIsSendHovered(false)}
            style={{
              backgroundColor: isSendHovered ? "#065e0b" : colors.primaryGreen,
              color: "white",
              fontSize: "1rem", // ~ lg:text-base
              padding: "0.5rem 1rem", // ~ lg:px-4 py-2
              borderRadius: "0.375rem", // rounded-md
              transition: "background-color 0.3s ease",
              marginLeft: "0.25rem", // ml-1
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
        <div className="">
          <button
            onClick={() => setShowTerms(true)}
            onMouseEnter={() => setIsTermsHovered(true)}
            onMouseLeave={() => setIsTermsHovered(false)}
            style={{
              color: isTermsHovered ? colors.primaryGreen : "white",
              fontSize: "0.875rem", // ~ lg:text-sm
              textDecoration: "underline",
              fontFamily: "Bambino",
              fontWeight: 350,
              transition: "color 0.3s ease",
              marginLeft: "0.5rem",
              cursor: "pointer",
            }}
          >
            Terms & Conditions
          </button>
          <div className="flex items-center">
            <img className="pl-2 mt-2 h-5 w-auto" src={card} alt="card" />
            <img className="pl-2 mt-2 h-5 w-auto" src={Halal} alt="Halal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
