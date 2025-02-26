import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
import Alert from "react-bootstrap/Alert";
import { clearAuthError, clearAuthMessage } from "../parts/users/authSlice";
import { clearUserMessage, clearUserError } from "./users/usersSlice";
import { clearProductMessage, clearProductError } from "./products/productsSlice";
import { useAppDispatch } from "../app/store";

const Alerts = () => {
  const message = useSelector(
    (state: {
      users: { message: string | null };
      auth: { message: string | null };
      products: { message: string | null };
    }) => state.users.message || state.auth.message /* || state.products.message */
  );
  const error = useSelector(
    (state: {
      users: { error: string | null };
      auth: { error: string | null };
      categories: { error: string | null };
      products: { error: string | null };
    }) => state.users.error || state.auth.error || state.products.error
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (message) {
      const messageTimeout = setTimeout(() => {
        dispatch(clearAuthMessage());
        dispatch(clearUserMessage());
        dispatch(clearProductMessage());
      }, 5000);
      return () => clearTimeout(messageTimeout);
    }
    if (error) {
      const errorTimeout = setTimeout(() => {
        dispatch(clearAuthError());
        dispatch(clearUserError());
        dispatch(clearProductError());
      }, 5000);
      return () => clearTimeout(errorTimeout);
    }
  }, [dispatch, message, error]);

  return (
    <div className="position-fixed top-0 start-50 translate-middle-x mt-1" style={{ zIndex: 2000, minWidth: "300px" }}>
      <Alert className="w-100 p-2 text-center mx-auto" show={!!message} variant="success">
        {message}
      </Alert>

      <Alert className="w-100 p-2 text-center mx-auto" show={!!error} variant="danger">
        {error}
      </Alert>
    </div>
  );
};

export default memo(Alerts);
