import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { Skeleton } from "../../../components/loader";

import {
  useDeleteOrderMutation,
  useOrderDetailsQuery,
  useUpdateOrderMutation,
} from "../../../redux/api/orderAPI";
import { RootState, server } from "../../../redux/store";
import { Order, OrderItem } from "../../../types/types";
import { responseToast } from "../../../utils/features";

const defaultOrder: Order = {
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  },
  status: "",
  subtotal: 0,
  discount: 0,
  shippingCharges: 0,
  tax: 0,
  total: 0,
  orderItems: [],
  user: { name: "", _id: "" },
  _id: "",
};

const TransactionManagement = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);

  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isLoading, data, isError } = useOrderDetailsQuery(params.id || "");

  const order = data?.order || defaultOrder;

  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const updateHandler = async () => {
    const res = await updateOrder({
      userId: user?._id || "",
      orderId: order._id,
    });
    responseToast(res, navigate, "/admin/transaction");
  };

  const deleteHandler = async () => {
    const res = await deleteOrder({
      userId: user?._id || "",
      orderId: order._id,
    });
    responseToast(res, navigate, "/admin/transaction");
  };

  if (isError) return <Navigate to={"/404"} />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {order && (
              <>
                <section
                  style={{
                    padding: "2rem",
                  }}
                >
                  <h2>Order Items</h2>

                  {order.orderItems.map((item) => (
                    <ProductCard key={item._id} {...item} />
                  ))}
                </section>

                <article className="shipping-info-card">
                  <button
                    className="product-delete-btn"
                    onClick={deleteHandler}
                  >
                    <FaTrash />
                  </button>
                  <h1>Order Info</h1>
                  <h5>User Info</h5>
                  <p>Name: {order.user.name}</p>
                  <p>
                    Address:{" "}
                    {`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.country} ${order.shippingInfo.pinCode}`}
                  </p>
                  <h5>Amount Info</h5>
                  <p>Subtotal: {order.subtotal}</p>
                  <p>Shipping Charges: {order.shippingCharges}</p>
                  <p>Tax: {order.tax}</p>
                  <p>Discount: {order.discount}</p>
                  <p>Total: {order.total}</p>

                  <h5>Status Info</h5>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        order.status === "Delivered"
                          ? "purple"
                          : order.status === "Shipped"
                          ? "green"
                          : "red"
                      }
                    >
                      {order.status}
                    </span>
                  </p>
                  <button className="shipping-btn" onClick={updateHandler}>
                    Process Status
                  </button>
                </article>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId,
}: OrderItem) => (
  <div className="transaction-product-card">
    <img src={`${server}/${photo}`} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} X {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
