import { ReactElement, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Skeleton } from "../components/loader";
import { useOrderDetailsQuery } from "../redux/api/orderAPI";
import { RootState } from "../redux/store";
import { CustomError } from "../types/api-types";
import AdminSidebar from "../components/admin/AdminSidebar";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetailsType {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  total: number;
  discount: number;
  status: string;
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.userReducer);

  const { isLoading, data, isError, error } = useOrderDetailsQuery(id || '');

  const [orderDetails, setOrderDetails] = useState<OrderDetailsType | null>(null);

  useEffect(() => {
    if (isError) {
      const err = error as CustomError;
      toast.error(err.data.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (data) {
      setOrderDetails(data.order);
    }
  }, [data]);

  if (!user) {
    return <Skeleton length={20} />;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>
        {isLoading ? (
          <Skeleton length={20} />
        ) : (
          <div className="order-details">
            <h1>Order Details</h1>
            {orderDetails && (
              <>
                <p><strong>Order ID:</strong> {orderDetails._id}</p>
                <p><strong>User:</strong> {orderDetails.user.name} ({orderDetails.user.email})</p>
                <p><strong>Total Amount:</strong> ${orderDetails.total}</p>
                <p><strong>Discount:</strong> ${orderDetails.discount}</p>
                <p><strong>Status:</strong> {orderDetails.status}</p>
                <h2>Items:</h2>
                <ul>
                  {orderDetails.orderItems.map((item, index) => (
                    <li key={index}>
                      <p><strong>Name:</strong> {item.name}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Price:</strong> ${item.price}</p>
                    </li>
                  ))}
                </ul>
                <Link to="/admin/orders">Back to Orders</Link>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderDetails;
