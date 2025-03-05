import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { ProductType } from "./productsSlice";
import { updateProduct, deleteProduct } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { memo, useState, useCallback, useEffect } from "react";

const ProductItem = ({
  product,
  setProductsList,
}: {
  product: ProductType;
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) => {
  const isChecked = useSelector(() => product.checked);
  const [checked, setChecked] = useState<boolean>(isChecked);
  const dispatch = useAppDispatch();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: "auto" });
  }, [scrollPosition]);

  useEffect(() => {
    setInputValue(product.name);
    setChecked(product.checked);
  }, [product]);

  const handleCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentScrollPosition = window.scrollY;
    setScrollPosition(currentScrollPosition);

    try {
      setChecked(e.target.checked);
      const updatedProduct = { ...product, checked: e.target.checked };
      setProductsList((prev) => prev.map((p) => (p.id === product.id ? updatedProduct : p)));
      await dispatch(updateProduct(updatedProduct)).unwrap();
    } catch (err) {
      console.error(err);

      const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];

      if (savedProducts.some((p) => p.id === product.id)) {
        const updatedProducts = savedProducts.map((p) =>
          p.id === product.id ? { ...p, checked: e.target.checked } : p
        );
        localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));
      } else {
        localStorage.setItem(
          "savedProducts",
          JSON.stringify([...savedProducts, { ...product, checked: e.target.checked }])
        );
      }
    }
  };

  const handleDelete = useCallback(async () => {
    try {
      setProductsList((prev) => prev.filter((p) => p.id !== product.id));
      await dispatch(deleteProduct(product.id as number)).unwrap();
    } catch (err) {
      console.error(err);

      const deletedProducts: ProductType[] =
        JSON.parse(localStorage.getItem("deletedProducts") as string) || [];
      const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];

      if (savedProducts.some((p) => p.id === product.id)) {
        localStorage.setItem(
          "savedProducts",
          JSON.stringify(savedProducts.filter((p) => p.id !== product.id))
        );
      }

      if (!deletedProducts.some((p: ProductType) => p.id === product.id)) {
        localStorage.setItem("deletedProducts", JSON.stringify([...deletedProducts, product]));
      }

      setProductsList((prev) => prev.filter((p) => p.id !== product.id));
    }
  }, [dispatch, product, setProductsList]);

  const onShowEdit = useCallback(() => {
    setIsEdit(true);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedProduct = { ...product, name: inputValue };

    try {
      if (inputValue === product.name || inputValue.trim() === "") {
        setIsEdit(false);
        return;
      }

      setProductsList((prev) => prev.map((p) => (p.id === product.id ? updatedProduct : p)));
      await dispatch(updateProduct(updatedProduct)).unwrap();
      setIsEdit(false);
    } catch (error) {
      const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];

      if (savedProducts.some((p) => p.id === updatedProduct.id)) {
        const updatedProducts = savedProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
        localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));
      } else {
        localStorage.setItem("savedProducts", JSON.stringify([...savedProducts, updatedProduct]));
      }
      setIsEdit(false);
      console.error(error);
    }
  };

  return (
    <>
      <ListGroup.Item
        key={product.id}
        className="d-flex align-items-center p-0 ps-3 rounded shadow-lg"
        style={checked ? { textDecoration: "line-through", color: "grey" } : {}}
        variant={checked ? "secondary" : "light"}
      >
        <input
          id={product.id?.toString()}
          type="checkbox"
          className="form-check-input m-0"
          style={{ width: "25px", height: "25px" }}
          onChange={handleCheck}
          checked={checked}
        />
        {isEdit ? (
          <form className="ps-3 w-100 d-flex align-items-center" onSubmit={handleEdit}>
            <input type="text" className="flex-grow-1" value={inputValue} onChange={onChange} autoFocus />
            <ButtonGroup>
              <Button type="submit" variant="outline-secondary" className="border-0 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-check"
                  viewBox="0 0 16 16"
                >
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                </svg>
              </Button>
            </ButtonGroup>
          </form>
        ) : (
          <label
            htmlFor={product.id?.toString()}
            className="form-check-label flex-grow-1 ps-3 full-height d-flex align-items-center"
            style={{ minHeight: "37px" }}
          >
            {inputValue}
          </label>
        )}

        {!isEdit && (
          <ButtonGroup>
            <Button variant="outline-secondary" className="border-0 text-center" onClick={onShowEdit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-pencil"
                viewBox="0 0 16 16"
              >
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
              </svg>
            </Button>

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
          </ButtonGroup>
        )}
      </ListGroup.Item>
    </>
  );
};

export default memo(ProductItem);
