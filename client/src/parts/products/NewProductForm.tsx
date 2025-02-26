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
  products,
}: {
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
  products: ProductType[];
}) => {
  const [name, setName] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(false);
  //const error = useSelector((state: { products: { error: string | null } }) => state.products.error);
  const [error, setError] = useState<string | null>(null);
  const message = useSelector((state: { products: { message: string | null } }) => state.products.message);
  const dispatch = useAppDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const inputRef = useRef<HTMLInputElement>(null);
  const productsStatus = useSelector(
    (state: { products: { status: "idle" | "loading" | "succeeded" | "failed" } }) => state.products.status
  );

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

    if (!name) {
      return;
    }

    const category = localStorage.getItem("category") ? JSON.parse(localStorage.getItem("category") as string) : "";
    const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];
    const newId = Math.max(
      (products[products.length - 1]?.id ?? 0) + 1,
      (savedProducts[savedProducts.length - 1]?.id ?? 0) + 1
    );

    const newProduct = {
      id: newId,
      name: name,
      category: category,
      checked: false,
      author_id: currentUserId as number,
    };

    try {
      if (!products.some((p) => p.name === newProduct.name)) {
        setProductsList((prev) => {
          return [...prev, { ...newProduct, id: (prev[prev.length - 1]?.id ?? 0) + 1 }];
        });
      }

      setName("");
      await dispatch(addProduct(newProduct)).unwrap();
      dispatch(clearProductError());
      setValidated(false);
      if (inputRef.current) {
        scrollToElement(inputRef.current);
      }

      await dispatch(fetchProducts(currentUserId as number)).unwrap();
      await dispatch(fetchUsers()).unwrap();
    } catch (error) {
      if (products.some((p) => p.name === newProduct.name)) {
        setError("Такой продукт уже существует");
        return;
      }

      const deletedProducts: ProductType[] = JSON.parse(localStorage.getItem("deletedProducts") as string) || [];

      // const updatedProducts = savedProducts.some((p) => p.id === newProduct.id)
      //   ? savedProducts.map((p) => (p.id === newProduct.id ? newProduct : p))
      //   : [...savedProducts, newProduct];

      if (deletedProducts.some((p) => p.id === newProduct.id)) {
        localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts.filter((p) => p.id !== newProduct.id)));
      }

      if (!savedProducts.some((p: ProductType) => p.id === newProduct.id)) {
        localStorage.setItem("savedProducts", JSON.stringify([...savedProducts, newProduct]));
      }

      //localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));

      setName("");
      setError("Ошибка добавления продукта. Сервер не отвечает");
      console.error("Ошибка добавления продукта", error);
    } finally {
      inputRef.current?.focus();
    }
  };

  const clearAlerts = () => {
    const timeout = setTimeout(() => {
      if (error) {
        dispatch(clearProductError());
        setError(null);
      }
      if (message) {
        dispatch(clearProductMessage());
      }
    }, 5000);

    return () => clearInterval(timeout);
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
                disabled={productsStatus === "loading"}
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
          disabled={productsStatus === "loading"}
        >
          добавить
        </Button>
      </Form>
    </Card>
  );
};

export default NewProductForm;
