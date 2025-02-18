import { memo } from "react";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { fetchProducts } from "./productsSlice";
import { selectCurrentUserId } from "../users/authSlice";
import { fetchUsers } from "../users/usersSlice";
import Button from "react-bootstrap/Button";

const ProductsSyncButton = () => {
  const dispatch = useAppDispatch();
  const currentUserId: number | null = useSelector(selectCurrentUserId);

  const handleSync = async () => {
    await dispatch(fetchProducts(currentUserId as number)).unwrap();
    await dispatch(fetchUsers()).unwrap();
  };

  return (
    <Button
      variant="light"
      className="text-primary-emphasis d-flex align-items-center justify-content-center rounded-0 border-0"
      onClick={handleSync}
    >
      sync
    </Button>
  );
};

export default memo(ProductsSyncButton);
