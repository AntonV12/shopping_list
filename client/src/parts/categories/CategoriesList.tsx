import React, { memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ListItem from "./ListItem";
import AddCategoryForm from "./AddCategoryForm";
import { selectCurrentUserId } from "../users/authSlice";
import { selectUserById, UserType, updateUser } from "../users/usersSlice";
import Button from "react-bootstrap/Button";
import { ProductType, /* updateProducts, */ deleteProduct } from "../products/productsSlice";
import { useAppDispatch } from "../../app/store";

const CategoriesList = ({
  category,
  setCategory,
  categories,
  setCategories,
  isFirstElement,
  setProductsList,
}: {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  isFirstElement: boolean;
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) => {
  const [isShowAddForm, setIsShowAddForm] = useState<boolean>(false);
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const currentUser = useSelector((state: { users: { users: UserType[] } }) =>
    selectUserById(state, currentUserId as number)
  );
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");

  useEffect(() => {
    try {
      setStatus("pending");

      const savedCategories: string[] = JSON.parse(localStorage.getItem("savedCategories") as string) || [];
      //const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];
      const deletedProducts: ProductType[] =
        JSON.parse(localStorage.getItem("deletedProducts") as string) || [];
      const deletedCategories: string[] =
        JSON.parse(localStorage.getItem("deletedCategories") as string) || [];

      if (deletedProducts.length > 0) {
        for (const product of deletedProducts) {
          dispatch(deleteProduct(product.id as number)).unwrap();
        }

        localStorage.removeItem("deletedProducts");
      }

      if (savedCategories.length > 0 /* || savedProducts.length > 0 */ || deletedCategories.length > 0) {
        if (currentUser) {
          const updatedCategories: string[] = savedCategories.filter((c) => !deletedCategories.includes(c));

          dispatch(
            updateUser({
              user: { ...currentUser, categories: updatedCategories },
            })
          ).unwrap();

          setCategories(updatedCategories);

          localStorage.removeItem("savedCategories");
          localStorage.removeItem("deletedCategories");
        }

        return;
      }

      setCategories(currentUser?.categories || []);
      setStatus("success");
    } catch (err) {
      setStatus("failed");
      console.error(err);
    } finally {
      setStatus("idle");
    }
  }, [dispatch, currentUser, setCategories]);

  const handleSetActiveCategory = (cat: string) => {
    setCategory(cat);
    localStorage.setItem("category", JSON.stringify(cat));
  };

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex flex-wrap justify-content-start align-items-center">
      {categories?.map((cat, index) => {
        const isHidden = isFirstElement && cat === "Все";
        return (
          <ListItem
            key={index}
            cat={cat as string}
            handleSetActiveCategory={handleSetActiveCategory}
            currentUser={currentUser as UserType}
            category={category}
            setCategory={setCategory}
            isFirstElement={isHidden}
            setProductsList={setProductsList}
            categories={categories}
            setCategories={setCategories}
          />
        );
      })}
      <div className="d-flex align-items-center justify-content-center mb-2">
        {isShowAddForm && currentUser ? (
          <AddCategoryForm
            currentUser={currentUser}
            setIsShowAddForm={setIsShowAddForm}
            handleSetActiveCategory={handleSetActiveCategory}
            setCategories={setCategories}
          />
        ) : (
          <Button
            variant="light"
            className="text-primary-emphasis d-flex align-items-center justify-content-center rounded-0 border-0"
            onClick={() => setIsShowAddForm(true)}
            style={{ height: "2.5rem" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-plus-square"
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
};
export default memo(CategoriesList);
