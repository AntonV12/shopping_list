import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/esm/Button";
import { useState } from "react";
import CategoriesList from "../categories/CategoriesList";
import { addProduct, clearProductError, clearProductMessage } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import { selectCurrentUserId } from "../users/authSlice";

const NewProductForm = () => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(false);
  const error = useSelector((state: { products: { error: string | null } }) => state.products.error);
  const message = useSelector((state: { products: { message: string | null } }) => state.products.message);
  const dispatch = useAppDispatch();
  const currentUserId = useSelector(selectCurrentUserId);

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
      const newProduct = {
        id: null,
        name: name,
        category: category,
        checked: false,
        author_id: currentUserId as number,
      };

      await dispatch(addProduct(newProduct)).unwrap();
      setName("");
      dispatch(clearProductError());
      setValidated(false);
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
    <Card className="w-100 d-flex justify-content-center mb-3 shadow-lg" style={{ maxWidth: "600px" }}>
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
                placeholder="Добавить продукт"
                value={name}
                onChange={handleChangeValue}
                onFocus={clearAlerts}
                isInvalid={error !== null}
                autoFocus
                autoComplete="off"
              />
            </div>
            <CategoriesList category={category} setCategory={setCategory} isFirstElement={true} />
          </Form.Group>

          <Form.Control.Feedback className="d-block" type={error ? "invalid" : "valid"} style={{ height: "10px" }}>
            {error ? error : message}
          </Form.Control.Feedback>
        </Row>

        <Button variant="light" className="bg-gradient bg-dark-subtle text-primary-emphasis" type="submit">
          отправить
        </Button>
      </Form>
    </Card>
  );
};

export default NewProductForm;
