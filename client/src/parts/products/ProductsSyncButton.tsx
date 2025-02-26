import { memo } from "react";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { fetchProducts, updateProduct, ProductType } from "./productsSlice";
import { selectCurrentUserId } from "../users/authSlice";
import { fetchUsers } from "../users/usersSlice";
import Button from "react-bootstrap/Button";

const ProductsSyncButton = () => {
  const dispatch = useAppDispatch();
  const currentUserId: number | null = useSelector(selectCurrentUserId);

  const handleSync = async () => {
    const updatedProducts = localStorage.getItem("updatedProducts");
    if (updatedProducts) {
      const products = JSON.parse(updatedProducts);
      products.forEach((product: ProductType) => {
        dispatch(updateProduct(product));
      });
      localStorage.removeItem("updatedProducts");
    }
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
