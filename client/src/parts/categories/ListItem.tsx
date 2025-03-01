import React, { memo, useState, useRef, useEffect } from "react";
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
  categories,
  productsList,
  setProductsList,
  setCategories,
}: {
  cat: string;
  handleSetActiveCategory: (cat: string) => void;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  isFirstElement: boolean;
  currentUser: UserType;
  productsList: ProductType[];
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  categories: string[];
}) => {
  const dispatch = useAppDispatch();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const products: ProductType[] = useSelector(selectAllProducts);
  const ref = useRef<HTMLDivElement>(null);
  const [isShowControl, setIsShowControl] = useState<boolean>(false);

  useEffect(() => {
    setInputValue(cat);
  }, [cat]);

  const handleDeleteCategory = async (cat: string) => {
    const confirm = window.confirm("Вы уверены, что хотите удалить эту категорию?");
    setCategory(cat);
    handleSetActiveCategory(cat);
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

        const deletedCategories: string[] = JSON.parse(localStorage.getItem("deletedCategories") as string) || [];
        deletedCategories.push(cat);
        const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || products;

        const deletedProducts: ProductType[] = savedProducts.filter((product) => product.category === cat);

        if (deletedCategories.length > 0) {
          const updatedCategories: string[] = categories.filter((c) => !deletedCategories.includes(c));
          setCategories(updatedCategories);
          const updatedProducts: ProductType[] = savedProducts.filter(
            (product) => !deletedCategories.includes(product.category)
          );
          localStorage.setItem("deletedCategories", JSON.stringify(deletedCategories));
          localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));
          localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts));
        }
      }
    }
  };

  const onChangeInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onShowEdit = () => {
    setIsEdit(true);
    setInputValue(cat);
    handleSetActiveCategory(cat);
    setCategory(cat);
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
        handleSetActiveCategory(inputValue);
        setCategory(inputValue);
        return;
      }

      const updatedUser: UserType = {
        ...currentUser,
        categories: currentUser.categories.map((c: string) => (c === cat ? inputValue : c)),
      };
      const updatedProducts: ProductType[] = productsList.map((product) =>
        product.category === cat ? { ...product, category: inputValue } : product
      );

      await dispatch(updateUser({ user: updatedUser })).unwrap();
      await dispatch(updateProducts({ products: updatedProducts })).unwrap();
    } catch (error) {
      console.error(error);

      const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || products;
      const savedCategories: string[] = JSON.parse(localStorage.getItem("savedCategories") as string) || categories;

      const updatedCategories: string[] = savedCategories.map((c) => (c === category ? inputValue : c));
      const updatedProducts: ProductType[] = savedProducts.map((product) =>
        product.category === category ? { ...product, category: inputValue } : product
      );

      localStorage.setItem("savedCategories", JSON.stringify(updatedCategories));
      localStorage.setItem("savedProducts", JSON.stringify(updatedProducts));

      setCategories(updatedCategories);
      setProductsList(updatedProducts);
    } finally {
      setIsShowControl(false);
      setCategory(inputValue);
      handleSetActiveCategory(inputValue);
      setIsEdit(false);
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
              style={{ backgroundColor: "#052c65" }}
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
            <ButtonGroup
              ref={ref}
              className="position-relative"
              onMouseEnter={() => setIsShowControl(true)}
              onMouseLeave={() => setIsShowControl(false)}
            >
              <Button
                variant="light"
                className="category-btn text-primary-emphasis d-flex align-items-center border border-0 rounded-0"
                active={cat === category}
                onClick={() => handleSetActiveCategory(cat as string)}
              >
                <p
                  className="m-0 me-2"
                  style={{
                    maxWidth: "10rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {inputValue}
                </p>
              </Button>
              {cat !== "Все" && cat === category && isShowControl && (
                <Button
                  variant="light"
                  className="control-btn d-flex align-items-center buttons-block text-primary-emphasis rounded-1 position-absolute"
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
