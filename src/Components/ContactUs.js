import React, { useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import customFetch from "../customFetch";
import { colors } from "../colors";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    };

    try {
      const response = await customFetch(
        "https://thevillage-backend.onrender.com/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("🎉 Message sent successfully!", {
          position: "top-center",
          autoClose: 3000,
          style: {
            backgroundColor: "#1D3A51", // Red
            color: "#fff",
          },
        });

        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("❌ Failed to send message. Please try again later.", {
          style: {
            backgroundColor: "#1D3A51", // Red
            color: "#fff",
          },
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Failed to send message. Please try again later.", {
        style: {
          backgroundColor: "#1D3A51", // Red
          color: "#fff",
        },
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className=" min-h-screen">
      {/* Header Section */}
      <section className="text-center py-20">
        <h2
          className="text-4xl lg:text-8xl font-bold "
          style={{
            fontFamily: "Bambino",
            fontWeight: 750,
            color: colors.primaryGreen,
          }}
        >
          CONTACT US
        </h2>
        <p
          className="mt-2 text-xs lg:text-lg text-black"
          style={{
            fontFamily: "Bambino",
            fontWeight: 450,
          }}
        >
          We would love to hear from you! Get in touch with us.
        </p>
      </section>

      {/* Contact Form and Info */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="bg-gray-100 p-6 shadow-xl rounded-lg col-span-1 lg:col-span-2 w-[100%]">
          <h4
            className="text-base lg:text-2xl font-semibold mb-4 flex justify-center"
            style={{
              fontFamily: "Bambino",
              fontWeight: 750,
            }}
          >
            GET IN TOUCH
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full p-1 lg:p-3 text-sm lg:text-base border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full p-1 lg:p-3 text-sm lg:text-base border rounded"
              required
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone"
              className="w-full p-1 lg:p-3 text-sm lg:text-base border rounded"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full p-1 lg:p-3 text-sm lg:text-base border rounded"
              rows="4"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full  text-sm lg:text-base text-white py-1 lg:py-3 rounded "
              style={{
                color: colors.primaryRed,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#880E0A")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = colors.primaryRed)
              }
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-100 p-6 shadow-lg rounded-lg col-span-1 py-20 w-[100%]">
          <h4
            className="text-base lg:text-2xl font-semibold mb-4 flex justify-center text-center"
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            CONTACT INFORMATION
          </h4>
          <a
            href="https://www.google.com/maps/place/The+Village+Pizzeria+Accrington/@53.752574,-2.3620782,17z/data=!3m1!4b1!4m6!3m5!1s0x487b99a6d0d54fdd:0xcd8bfd7f971c93c3!8m2!3d53.752574!4d-2.3620782!16s%2Fg%2F11v0bqk882?entry=ttu&g_ep=EgoyMDI1MDYyMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm lg:text-xl font-semibold mb-4 flex justify-center items-center text-center hover:underline text-inherit"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          >
            <FaMapMarkerAlt
              className=" mr-2"
              style={{ color: colors.primaryGreen }}
            />
            3 Blackburn Rd, Accrington BB5 1HF, United Kingdom
          </a>

          <p
            className="text-sm lg:text-xl font-semibold mb-4 flex justify-center items-center"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          >
            <FaEnvelope
              className=" mr-2"
              style={{ color: colors.primaryGreen }}
            />
            <a
              href="mailto:info@example.com"
              className="hover:underline text-inherit"
            >
              info@example.com
            </a>
          </p>
          <p
            className="text-sm lg:text-xl font-semibold mb-4 flex justify-center items-center"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          >
            <FaPhoneAlt
              className=" mr-2"
              style={{ color: colors.primaryGreen }}
            />
            <a
              href="tel:+441254205542"
              className="hover:underline text-inherit"
            >
              +44 1254 205542
            </a>
          </p>
          <h4
            className="text-base lg:text-2xl font-semibold mb-4 flex justify-center mt-10"
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            FOLLOW US
          </h4>
          <div className="flex justify-center space-x-4 mt-4">
            <a
              href="https://www.instagram.com/thevillagepizzeria.official?igsh=MWo1ODVzbzhoeDNiag=="
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 lg:w-12 h-auto  transition duration-300 mr-4 ml-4 lg:mr-8 lg:ml-8 "
                style={{ fill: colors.primaryRed }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.fill = colors.primaryGreen)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.fill = colors.primaryRed)
                }
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.416.407a4.92 4.92 0 0 1 1.68 1.094c.486.487.85 1.047 1.094 1.68.167.446.353 1.246.407 2.416.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.407 2.416a4.92 4.92 0 0 1-1.094 1.68c-.487.486-1.047.85-1.68 1.094-.446.167-1.246.353-2.416.407-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.416-.407a4.92 4.92 0 0 1-1.68-1.094c-.486-.487-.85-1.047-1.094-1.68-.167-.446-.353-1.246-.407-2.416-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.407-2.416a4.92 4.92 0 0 1 1.094-1.68c.487-.486 1.047-.85 1.68-1.094.446-.167 1.246-.353 2.416-.407C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.332.013 7.05.072 5.77.13 4.885.313 4.155.595 3.315.903 2.672 1.347 2.03 1.99c-.642.643-1.087 1.285-1.395 2.125-.282.73-.465 1.615-.523 2.895C.013 8.332 0 8.74 0 12s.013 3.668.072 4.95c.058 1.28.241 2.165.523 2.895.308.84.753 1.482 1.395 2.125.642.642 1.285 1.087 2.125 1.395.73.282 1.615.465 2.895.523C8.332 23.987 8.74 24 12 24s3.668-.013 4.95-.072c1.28-.058 2.165-.241 2.895-.523.84-.308 1.482-.753 2.125-1.395.642-.642 1.087-1.285 1.395-2.125.282-.73.465-1.615.523-2.895C23.987 15.668 24 15.26 24 12s-.013-3.668-.072-4.95c-.058-1.28-.241-2.165-.523-2.895-.308-.84-.753-1.482-1.395-2.125-.642-.642-1.285-1.087-2.125-1.395-.73-.282-1.615-.465-2.895-.523C15.668.013 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zm0 10.162a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-10.845a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="container mx-auto my-6">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2242.348526900332!2d-2.364653123386057!3d53.75257397240991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487b99a6d0d54fdd%3A0xcd8bfd7f971c93c3!2sThe%20Village%20Pizzeria%20Accrington!5e1!3m2!1sen!2s!4v1741128012566!5m2!1sen!2s"
          width="100%"
          height="300"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ContactUs;
