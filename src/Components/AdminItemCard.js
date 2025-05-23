import React from "react";
import background from "../images/Pizza1.jpeg";

function AdminItemCard(props) {
  const TitleTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
  };
  const DescTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 350,
  };
  const StartingTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 450,
  };
  const PriceTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
    color: "#074711",
  };
  const AddCartTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 450,
    backgroundColor: "#CB6CE6",
    height: "30px",
  };

  // Extract the first price if it's an object
  let startingPrice;
  if (typeof props.menuItems.price === "object") {
    const firstKey = Object.keys(props.menuItems.price)[0]; // Get first key
    startingPrice = props.menuItems.price[firstKey]; // Get first price value
  } else {
    startingPrice = props.menuItems.price; // If it's a single value, use it directly
  }

  return (
    <div>
      <div
        className="relative max-w-sm shadow-xl h-[260px] md:h-[100px] "
        style={{ backgroundColor: "#F2D9F9", borderRadius: "20px" }}
      >
        <div className="px-2 md:px-4 py-1  grid grid-cols-10 items-center">
          <div className="col-span-7">
            <div
              className="text-xs md:text-base py-2 md:py-4 h-[60px] md:h-[90px] flex justify-start text-start items-center"
              style={TitleTextStyle}
            >
              {props.menuItems.title}
            </div>
          </div>

          <div className="flex justify-center col-span-3 items-center">
            <button
              onClick={props.onAddToCart}
              className="flex w-full items-center justify-center text-black py-6 mx-1 text-xxs md:text-3xl focus:outline-none my-2 md:my-4 rounded-lg"
              style={AddCartTextStyle}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminItemCard;
