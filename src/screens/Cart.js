import React from "react";
import Delete from "@material-ui/icons/Delete";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { loadStripe } from "@stripe/stripe-js";
// require("dotenv").config();
export default function Cart() {
  let data = useCart();
  let dispatch = useDispatchCart();
  if (data.length === 0) {
    return (
      <div style={{ backgroundColor: "white" }}>
        <div className="m-5 w-100 text-center fs-3">The Cart is Empty!</div>
      </div>
    );
  }

  const stripePromise = loadStripe(
    "pk_test_51O84cFSFPq99oONQ3EgDvatgBVE7tP9cJD52ofu2J0oRylDdiMdmxRx9PBCFQobavUPHwTTK4aJD50OmJGURO5P2007QdyVoIb"
  );

  const handleCheckOut = async () => {
    let userEmail = localStorage.getItem("userEmail");
    let response = await fetch("http://localhost:3030/api/auth/orderData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_data: data,
        email: userEmail,
        order_date: new Date().toDateString(),
      }),
    });

    if (response.status === 200) {
      // Get the Stripe instance
      const stripe = await stripePromise;
      // Create a checkout session
      const session = await fetch(
        "http://localhost:3030/api/auth/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            email: userEmail,
          }),
        }
      ).then((res) => res.json());

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      // Handle the result
      if (result.error) {
        // Display an error message to the user
        console.error(result.error.message);
      } else {
        // Payment was successful, update your UI or redirect to a success page
        console.log("Payment succeeded");
      }
    }
  };

  let totalPrice = data.reduce((total, food) => total + food.price, 0);
  return (
    <div style={{ backgroundColor: "white" }}>
      <div
        className="container m-auto mt-5 table-responsive  table-responsive-sm table-responsive-md"
        style={{ backgroundColor: "white" }}
      >
        <table
          className="table table-hover "
          style={{ backgroundColor: "white" }}
        >
          <thead className=" text-success fs-4">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Quantity</th>
              <th scope="col">Option</th>
              <th scope="col">Amount</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((food, index) => (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>{food.name}</td>
                <td>{food.qty}</td>
                <td>{food.size}</td>
                <td>{food.price}</td>
                <td>
                  <button type="button" className="btn p-0">
                    <Delete
                      onClick={() => {
                        dispatch({ type: "REMOVE", index: index });
                      }}
                    />
                  </button>{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ backgroundColor: "white" }}>
          <h1 className="fs-2">Total Price: {totalPrice}/-</h1>
        </div>
        <div>
          <button className="btn bg-success mt-5 " onClick={handleCheckOut}>
            {" "}
            Check Out{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
