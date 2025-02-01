import React, { memo, useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { updateProducts } from "../products/productsSlice";
import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { updateUser, UserType, setUserError } from "../users/usersSlice";
import { ProductType, selectAllProducts, deleteProduct } from "../products/productsSlice";

const ListItem = ({
  cat,
  handleSetActiveCategory,
  category,
  setCategory,
  isFirstElement,
  currentUser,
}: {
  cat: string;
  handleSetActiveCategory: (cat: string) => void;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  isFirstElement: boolean;
  currentUser: UserType;
}) => {
  const dispatch = useAppDispatch();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const products: ProductType[] = useSelector(selectAllProducts);
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(ref.current?.offsetWidth || 0);

  const handleDeleteCategory = async (cat: string) => {
    const confirm = window.confirm("Вы уверены, что хотите удалить эту категорию?");
    if (confirm) {
      try {
        const updatedUser: UserType = {
          ...currentUser,
          categories: currentUser.categories.filter((c: string) => c !== cat),
        };
        const deletedProducts = products.filter((product) => product.category === cat);
        await dispatch(updateUser({ user: updatedUser })).unwrap();

        for (const product of deletedProducts) {
          await dispatch(deleteProduct(product.id as number)).unwrap();
        }
        handleSetActiveCategory("Все");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onChangeInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onShowEdit = () => {
    setWidth(ref.current?.offsetWidth || 0);
    setIsEdit(true);
    setInputValue(cat);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!inputValue) return;
      if (currentUser.categories.some((c) => c.toLowerCase().trim() === inputValue.toLowerCase().trim() && c !== cat)) {
        dispatch(setUserError("Такая категория уже есть"));
        return;
      }
      if (inputValue === cat) {
        setIsEdit(false);
        return;
      }
      const updatedUser: UserType = {
        ...currentUser,
        categories: currentUser.categories.map((c: string) => (c === cat ? inputValue : c)),
      };
      const updatedProducts: ProductType[] = products.map((product) =>
        product.category === cat ? { ...product, category: inputValue } : product
      );

      await dispatch(updateUser({ user: updatedUser })).unwrap();
      await dispatch(updateProducts({ products: updatedProducts })).unwrap();
      setCategory(inputValue);
      handleSetActiveCategory(inputValue);
      setIsEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {!isFirstElement && (
        <>
          {isEdit ? (
            <form
              onSubmit={handleSubmit}
              className="d-flex p-1 align-items-center rounded "
              style={{ maxWidth: width, backgroundColor: "#052c65" }}
            >
              <input
                type="text"
                className="form-control p-1"
                value={inputValue}
                onChange={onChangeInputValue}
                autoFocus
                maxLength={20}
              />
              <button type="submit" className="bg-transparent border border-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  fill="white"
                  className="bi bi-check"
                  viewBox="0 0 16 16"
                >
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                </svg>
              </button>
            </form>
          ) : (
            <ButtonGroup ref={ref}>
              <Button
                variant="light"
                className=" text-primary-emphasis d-flex align-items-center border border-0 rounded-0"
                active={cat === category}
                onClick={() => handleSetActiveCategory(cat as string)}
                style={{ height: "2.5rem" }}
              >
                <p className="m-0 me-2" style={{ maxWidth: "10rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {cat}
                </p>
              </Button>
              {cat !== "Все" && cat === category && (
                <Button
                  variant="light"
                  className="d-flex align-items-center buttons-block p-1.5  text-primary-emphasis border border-0 rounded-0"
                  style={{ height: "2.5rem" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-pencil me-2"
                    viewBox="0 0 16 16"
                    style={{ display: cat === "Все" ? "none" : "inline-block" }}
                    onClick={onShowEdit}
                  >
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                    style={{ display: cat === "Все" ? "none" : "inline-block" }}
                    onClick={() => handleDeleteCategory(cat as string)}
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </Button>
              )}
            </ButtonGroup>
          )}
        </>
      )}
    </>
  );
};

export default memo(ListItem);
