import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { ProductType } from "./productsSlice";
import { updateProduct, deleteProduct } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
//import { useSelector } from "react-redux";
import { memo, useState, useCallback } from "react";

const ProductItem = ({
  product,
  setProductsList,
}: {
  product: ProductType;
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) => {
  //const isChecked = useSelector(() => product.checked);
  const [isChecked, setIsChecked] = useState<boolean>(product.checked);
  const dispatch = useAppDispatch();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(product.name);

  const handleCheck = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      setProductsList((prev) => prev.map((p) => (p.id === product.id ? { ...p, checked: e.target.checked } : p)));
      const updatedProduct = { ...product, checked: e.target.checked };
      await dispatch(updateProduct(updatedProduct)).unwrap();
    },
    [dispatch, product, setProductsList]
  );

  const handleDelete = useCallback(async () => {
    await dispatch(deleteProduct(product.id as number)).unwrap();
    setProductsList((prev) => prev.filter((p) => p.id !== product.id));
  }, [dispatch, product.id, setProductsList]);

  const onShowEdit = useCallback(() => {
    setIsEdit(true);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleEdit = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        if (inputValue === product.name || inputValue.trim() === "") {
          setIsEdit(false);
          return;
        }

        const updatedProduct = { ...product, name: inputValue };
        dispatch(updateProduct(updatedProduct));
        setIsEdit(false);
      } catch (error) {
        console.error(error);
      }
    },
    [dispatch, inputValue, product]
  );

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
          onChange={handleCheck}
          checked={isChecked}
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
