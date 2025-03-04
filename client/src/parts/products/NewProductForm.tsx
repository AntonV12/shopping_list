import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/esm/Button";
import { useState, useRef, useEffect } from "react";
import { addProduct, clearProductError, clearProductMessage, fetchProducts, ProductType } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import Card from "react-bootstrap/Card";
import { selectCurrentUserId } from "../users/authSlice";

const NewProductForm = ({
  setProductsList,
  products,
}: {
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
  products: ProductType[];
}) => {
  const [name, setName] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const message = useSelector((state: { products: { message: string | null } }) => state.products.message);
  const dispatch = useAppDispatch();
  const currentUserId = useSelector(selectCurrentUserId);
  const inputRef = useRef<HTMLInputElement>(null);
  //const feedbackRef = useRef<HTMLDivElement>(null);
  const productsStatus = useSelector(
    (state: { products: { status: "idle" | "loading" | "succeeded" | "failed" } }) => state.products.status
  );
  const [isFeedbackVisible, setIsFeedbackVisible] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToElement = (elem: HTMLElement) => {
    elem.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFeedbackVisible(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

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

    const newProduct = {
      id: null,
      name: name,
      category: category,
      checked: false,
      author_id: currentUserId as number,
    };

    try {
      if (![...products, ...savedProducts].some((p) => p.name === newProduct.name)) {
        setProductsList((prev) => {
          return [...prev, { ...newProduct, id: (prev[prev.length - 1]?.id ?? 0) + 1 }];
        });
      } else {
        setIsFeedbackVisible(true);
        setError("Такой продукт уже существует");

        timeoutRef.current = setTimeout(() => {
          setError(null);
          setIsFeedbackVisible(false);
        }, 3000);
      }

      setName("");
      await dispatch(addProduct(newProduct)).unwrap();
      dispatch(clearProductError());
      setError(null);
      setValidated(false);
      if (inputRef.current) {
        scrollToElement(inputRef.current);
      }
      setIsFeedbackVisible(true);

      timeoutRef.current = setTimeout(() => {
        dispatch(clearProductError());
        dispatch(clearProductMessage());
        setError(null);
      }, 3000);

      dispatch(fetchProducts(currentUserId as number)).unwrap();
    } catch (error) {
      if (products.some((p) => p.name === newProduct.name)) {
        setIsFeedbackVisible(true);
        setError("Такой продукт уже существует");

        timeoutRef.current = setTimeout(() => {
          setError(null);
        }, 3000);
        return;
      }

      const deletedProducts: ProductType[] = JSON.parse(localStorage.getItem("deletedProducts") as string) || [];

      if (deletedProducts.some((p) => p.id === newProduct.id)) {
        localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts.filter((p) => p.id !== newProduct.id)));
      }

      if (!savedProducts.some((p: ProductType) => p.name === newProduct.name)) {
        localStorage.setItem("savedProducts", JSON.stringify([...savedProducts, newProduct]));
      }

      setName("");
      console.error(error);
    } finally {
      inputRef.current?.focus();
      setValidated(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
                isInvalid={error !== null}
                autoComplete="off"
                ref={inputRef}
                disabled={productsStatus === "loading"}
              />
            </div>
          </Form.Group>

          <Form.Control.Feedback className="d-block" type={error ? "invalid" : "valid"} style={{ height: "10px" }}>
            <span /* ref={feedbackRef} */ className={isFeedbackVisible ? "visible" : "hidden"}>
              {error ? error : message}
            </span>
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
