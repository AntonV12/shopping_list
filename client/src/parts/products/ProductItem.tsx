import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { ProductType } from "./productsSlice";
import { updateProduct, deleteProduct } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { memo } from "react";

const ProductItem = ({
  product,
  setProductsList,
}: {
  product: ProductType;
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) => {
  const isChecked = useSelector(() => product.checked);
  const dispatch = useAppDispatch();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedProduct = { ...product, checked: e.target.checked };
    await dispatch(updateProduct(updatedProduct)).unwrap();
  };

  const handleDelete = async () => {
    await dispatch(deleteProduct(product.id as number)).unwrap();
    setProductsList((prev) => prev.filter((p) => p.id !== product.id));
  };

  return (
    <>
      <ListGroup.Item
        className="d-flex align-items-center p-0 ps-3 rounded shadow-lg"
        style={isChecked ? { textDecoration: "line-through", color: "grey" } : {}}
        variant={isChecked ? "secondary" : "light"}
      >
        <input
          id={product.id?.toString()}
          type="checkbox"
          className="form-check-input m-0"
          style={{ width: "25px", height: "25px" }}
          onChange={handleChange}
          checked={isChecked}
        />
        <label htmlFor={product.id?.toString()} className="form-check-label flex-grow-1 ps-3  h-100">
          {product.name}
        </label>

        <Button variant="outline-secondary" className="border-0" onClick={handleDelete}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
          </svg>
        </Button>
      </ListGroup.Item>
    </>
  );
};
export default memo(ProductItem);
