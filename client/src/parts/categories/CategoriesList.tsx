import React, { memo, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { selectAllProducts, ProductType } from "../products/productsSlice";
import { useSelector } from "react-redux";
import ListItem from "./ListItem";
import AddCategoryForm from "./AddCategoryForm";
import { selectCurrentUserId } from "../users/authSlice";
import { selectUserById, UserType } from "../users/usersSlice";

const CategoriesList = ({
  category,
  setCategory,
  isFirstElement,
}: {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  isFirstElement: boolean;
}) => {
  const products: ProductType[] = useSelector(selectAllProducts);
  const [isShowAddForm, setIsShowAddForm] = useState<boolean>(false);
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const currentUser = useSelector((state: { users: { users: UserType[] } }) =>
    selectUserById(state, currentUserId as number)
  );
  const categories = currentUser?.categories;
  const filteredList = Array.from(new Set(["Все", ...products.map((product) => product.category)]).values());
  const categoriesList = isFirstElement ? categories : filteredList;

  const handleSetActiveCategory = (cat: string) => {
    setCategory(cat);
    if (!isFirstElement) {
      localStorage.setItem("category", JSON.stringify(cat));
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="dropdown-basic" className="bg-gradient bg-dark-subtle text-primary-emphasis">
        {category || "Категория"}
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-0">
        {categoriesList?.map((cat, index) => {
          const isHidden = isFirstElement && cat === "Все";
          return (
            <div className="d-flex" key={index}>
              <ListItem
                cat={cat as string}
                handleSetActiveCategory={handleSetActiveCategory}
                currentUser={currentUser as UserType}
                category={category}
                setCategory={setCategory}
                isFirstElement={isHidden}
              />
            </div>
          );
        })}
        {isFirstElement && (
          <div className="d-flex align-items-center justify-content-center mb-2">
            {isShowAddForm && currentUser ? (
              <AddCategoryForm currentUser={currentUser} setIsShowAddForm={setIsShowAddForm} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                fill="currentColor"
                className="bi bi-plus-circle mb-1"
                viewBox="0 0 16 16"
                onClick={() => setIsShowAddForm(true)}
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
            )}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default memo(CategoriesList);
