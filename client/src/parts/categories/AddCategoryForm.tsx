import { useState, memo } from "react";
import { useAppDispatch } from "../../app/store";
import { updateUser, UserType, setUserError, fetchUserById } from "../users/usersSlice";

const AddCategoryForm = ({
  currentUser,
  setIsShowAddForm,
  handleSetActiveCategory,
  setCategories,
}: {
  currentUser: UserType;
  setIsShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetActiveCategory: (cat: string) => void;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const dispatch = useAppDispatch();
  const [userStatus, setUserStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");

  const onChangeInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserStatus("pending");

    const user = await dispatch(fetchUserById(currentUser.id as number)).unwrap();

    try {
      if (!inputValue) return;
      if (
        user.categories.some((category) => category.toLowerCase().trim() === inputValue.toLowerCase().trim())
      ) {
        dispatch(setUserError("Такая категория уже есть"));
        return;
      }

      const updatedUser: UserType = {
        ...user,
        categories: [...user.categories, inputValue],
      };

      await dispatch(updateUser({ user: updatedUser })).unwrap();
      setCategories(updatedUser.categories);
      handleSetActiveCategory(inputValue);
      setInputValue("");
      setUserStatus("success");
    } catch (error) {
      console.error(error);

      const savedCategories: string[] =
        JSON.parse(localStorage.getItem("savedCategories") as string) || user.categories;

      if (
        !savedCategories.some((category) => category.toLowerCase().trim() === inputValue.toLowerCase().trim())
      ) {
        const updatedCategories: string[] = [...savedCategories, inputValue];
        localStorage.setItem("savedCategories", JSON.stringify(updatedCategories));
        setCategories(updatedCategories);
        handleSetActiveCategory(inputValue);
      }
      setUserStatus("failed");
    } finally {
      setIsShowAddForm(false);
      setUserStatus("idle");
    }
  };

  return (
    <form
      id="addCategoryForm"
      onSubmit={handleSubmit}
      className="d-flex p-1 align-items-center"
      style={{ height: "46px" }}
    >
      <input
        type="text"
        className="w-75 me-1 form-control"
        value={inputValue}
        onChange={onChangeInputValue}
        autoFocus
        placeholder="Новая категория"
        maxLength={20}
        disabled={userStatus === "pending"}
      />
      <button type="submit" className="border-0 btn btn-outline-secondary p-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
          className="bi bi-check"
          viewBox="0 0 16 16"
        >
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
        </svg>
      </button>
    </form>
  );
};

export default memo(AddCategoryForm);
