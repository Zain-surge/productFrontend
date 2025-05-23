import { Link, useLocation } from "react-router-dom";
import logo from "../images/tvpLogo.png";
import { useState } from "react";

const Footer = () => {
  const location = useLocation();
  const [message, setMessage] = useState("");

  const isActive = (path) => location.pathname === path;

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage(""); // Clear the input field after sending
    }
  };

  const NavBarTextStyle = "text-white transition duration-300";
  const NavBarTextStyleHover = "text-[#074711]";

  return (
    <footer
      className="bg-[#AA1B17] text-white text-center py-8 grid grid-cols-2 lg:grid-cols-7 mt-5"
      style={{
        width: isActive("/") && window.innerWidth > 768 ? "75%" : "100%",
      }}
    >
      {/* Logo */}
      <div className="text-2xl font-bold flex justify-center align-middle col-span-2">
        <img className="h-16 lg:h-32 w-auto" src={logo} alt="Logo" />
      </div>

      {/* Navigation Links */}
      <div className="col-span-2 lg:col-span-3">
        <div className="flex justify-center space-x-4 lg:space-x-6 lg:space-x-8 mt-4 ">
          {/* <Link
            to="/"
            className="my-3 py-1 px-3 lg:px-6 lg:px-8 text-xxs lg:text-sm lg:text-md"
            style={
              isActive("/")
                ? {
                    fontFamily: "Bambino",
                    fontWeight: 750,
                    textDecoration: "underline",
                    textDecorationColor: "#074711",
                    textDecorationThickness: "3px",
                    textUnderlineOffset: "5px",
                  }
                : { fontFamily: "Bambino", fontWeight: 750 }
            }
          >
            HOME
          </Link> */}
          <Link
            to="/"
            className="my-3 py-1 px-3 lg:px-6 lg:px-8 text-xxs lg:text-sm lg:text-md"
            style={
              isActive("/")
                ? {
                    fontFamily: "Bambino",
                    fontWeight: 750,
                    textDecoration: "underline",
                    textDecorationColor: "#074711",
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
                    textDecorationColor: "#074711",
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
          <a href="#" aria-label="Facebook">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-6 h-6 hover:fill-[#074711] transition duration-300  mr-4 ml-4 lg:mr-8 lg:ml-8 fill-black"
            >
              <path d="M22 12.073C22 5.935 17.075 1 10.927 1S0 5.935 0 12.073C0 17.547 4.023 22.135 9.28 23v-7.734H6.653V12.07h2.627V9.645c0-2.6 1.538-4.036 3.89-4.036 1.129 0 2.31.202 2.31.202v2.57h-1.301c-1.28 0-1.68.794-1.68 1.605v1.922h2.86l-.457 3.195h-2.403V23C17.977 22.135 22 17.547 22 12.073z" />
            </svg>
          </a>
          <a href="#" aria-label="Twitter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-6 h-6 hover:fill-[#074711] transition duration-300 mr-4 ml-4 lg:mr-8 lg:ml-8 fill-black"
            >
              <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.956-2.178-1.555-3.594-1.555-2.72 0-4.924 2.204-4.924 4.924 0 .386.044.763.128 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.423.726-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.825-.413.111-.849.171-1.296.171-.318 0-.626-.031-.927-.089.626 1.956 2.445 3.379 4.604 3.42-1.685 1.319-3.808 2.104-6.115 2.104-.397 0-.788-.023-1.175-.068 2.179 1.396 4.765 2.212 7.548 2.212 9.056 0 14.01-7.496 14.01-13.986 0-.213-.005-.426-.015-.637.961-.695 1.8-1.562 2.46-2.549z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/thevillagepizzeria.official?igsh=MWo1ODVzbzhoeDNiag=="
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-6 h-6 hover:fill-[#074711] transition duration-300 mr-4 ml-4 lg:mr-8 lg:ml-8 fill-black"
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
            className="bg-[#074711] text-sm lg:text-base text-white px-2 py-1 lg:px-4 lg:py-2 rounded-md hover:bg-green-800 transition duration-300 ml-1"
          >
            Send
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
