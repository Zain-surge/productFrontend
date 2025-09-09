import { colors } from "../colors";
import { getMenuItemImage } from "./menuItemImageMapping"; // Import your mapping function

function ItemCard(props) {
  const TitleTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 550,
  };
  const DescTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 350,
  };
  const StartingTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
  };
  const PriceTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 550,
    color: colors.primaryGreen,
  };
  const AddCartTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
    backgroundColor: colors.primaryRed,
  };

  let startingPrice;

  if (typeof props.menuItems.price === "object") {
    const values = Object.values(props.menuItems.price); // extract all prices
    startingPrice = Math.min(...values); // find the lowest one
  } else {
    startingPrice = props.menuItems.price;
  }


  // Get the specific image for this menu item using your mapping
  const itemImage = getMenuItemImage(props.menuItems.title, props.menuItems.image);

  return (
    <div>
      <div
        className="relative max-w-sm mt-11 rounded-lg shadow-xl h-100 "
        style={{ backgroundColor: "#F6F5F5" }}
      >
        <div className="relative w-full h-0" style={{ paddingBottom: "35%" }}>
          <img
            className="absolute top-[-50%] left-1/2 transform -translate-x-1/2 w-[50%] rounded-lg shadow-lg"
            src={itemImage} // Now shows the specific image for each item
            alt={props.menuItems.title}
          />
        </div>
        <div className="px-2 lg:px-6 pb-4  ">
          <div
            className="text-sm lg:text-base py-2 lg:py-4 h-[60px] lg:h-[70px] flex justify-center text-center"
            style={TitleTextStyle}
          >
            {props.menuItems.title}
          </div>
          <p
            className="text-xxs lg:text-xs px-2 lg:px-4 h-[50px] flex justify-center text-center"
            style={DescTextStyle}
          >
            {props.menuItems.description}
          </p>
          <p
            className="text-xxxs lg:text-xs px-4 py-4 h-[20px] lg:h-[40px] flex justify-center text-center"
            style={StartingTextStyle}
          >
            STARTING FROM
          </p>
          <p
            className="text-sm lg:text-lg px-4 h-[20px] lg:h-[40px] flex justify-center"
            style={PriceTextStyle}
          >
            £{Number(startingPrice).toFixed(2)}
          </p>
          <div className="flex justify-center">
            <button
              onClick={props.onAddToCart}
              className="flex w-2/3 items-center justify-center text-white py-1 text-xxs lg:text-sm focus:outline-none my-2 lg:my-4 rounded-lg"
              style={AddCartTextStyle}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;