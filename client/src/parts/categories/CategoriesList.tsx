import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import ListItem from "./ListItem";
import AddCategoryForm from "./AddCategoryForm";
import { selectCurrentUserId } from "../users/authSlice";
import { selectUserById, UserType } from "../users/usersSlice";
import Button from "react-bootstrap/Button";

const CategoriesList = ({
  category,
  setCategory,
  isFirstElement,
}: {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  isFirstElement: boolean;
}) => {
  const [isShowAddForm, setIsShowAddForm] = useState<boolean>(false);
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const currentUser = useSelector((state: { users: { users: UserType[] } }) =>
    selectUserById(state, currentUserId as number)
  );
  const categories = currentUser?.categories;

  const handleSetActiveCategory = (cat: string) => {
    setCategory(cat);
    localStorage.setItem("category", JSON.stringify(cat));
  };

  return (
    <div className="d-flex flex-wrap mb-2 justify-content-start">
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
          />
        );
      })}
      <div className="d-flex align-items-center justify-content-center mb-2">
        {isShowAddForm && currentUser ? (
          <AddCategoryForm currentUser={currentUser} setIsShowAddForm={setIsShowAddForm} />
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
