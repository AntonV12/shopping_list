import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/esm/Button";
import { useState, useRef } from "react";
import { addProduct, clearProductError, clearProductMessage, fetchProducts } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import { selectCurrentUserId } from "../users/authSlice";
import { fetchUsers } from "../users/usersSlice";
import { ProductType } from "./productsSlice";

const NewProductForm = ({
  setProductsList,
}: {
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) => {
  const [name, setName] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(false);
  const error = useSelector((state: { products: { error: string | null } }) => state.products.error);
  const message = useSelector((state: { products: { message: string | null } }) => state.products.message);
  const dispatch = useAppDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToElement = (elem: HTMLElement) => {
    elem.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form: HTMLFormElement = e.currentTarget;

    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValidated(true);

    try {
      const category = localStorage.getItem("category") ? JSON.parse(localStorage.getItem("category") as string) : "";

      const newProduct = {
        id: null,
        name: name,
        category: category,
        checked: false,
        author_id: currentUserId as number,
      };
      setProductsList((prev) => {
        return [...prev, { ...newProduct, id: (prev[prev.length - 1]?.id ?? 0) + 1 }];
      });

      await dispatch(addProduct(newProduct)).unwrap();

      setName("");
      dispatch(clearProductError());
      setValidated(false);
      if (inputRef.current) {
        scrollToElement(inputRef.current);
      }

      await dispatch(fetchProducts(currentUserId as number)).unwrap();
      await dispatch(fetchUsers()).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const clearAlerts = () => {
    if (error) {
      dispatch(clearProductError());
    }
    if (message) {
      dispatch(clearProductMessage());
    }
  };

  return (
    <Card className="w-100 d-flex justify-content-center mb-3 shadow-lg" style={{ maxWidth: "700px" }}>
      <Form noValidate validated={validated} className="p-3 w-100" id="new-product-form" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group className="d-flex align-items-end justify-content-center">
            <div className="me-2 w-100">
              <Form.Label htmlFor="name">Добавить продукт</Form.Label>
              <Form.Control
                required
                id="name"
                name="name"
                type="text"
                placeholder="Введите название продукта"
                value={name}
                onChange={handleChangeValue}
                onFocus={clearAlerts}
                isInvalid={error !== null}
                autoComplete="off"
                ref={inputRef}
              />
            </div>
          </Form.Group>

          <Form.Control.Feedback className="d-block" type={error ? "invalid" : "valid"} style={{ height: "10px" }}>
            {error ? error : message}
          </Form.Control.Feedback>
        </Row>

        <Button
          variant="light"
          className="bg-gradient bg-dark-subtle text-primary-emphasis d-flex align-items-center justify-content-center pt-2"
          type="submit"
        >
          добавить
        </Button>
      </Form>
    </Card>
  );
};

export default NewProductForm;
