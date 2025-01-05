import { memo } from "react";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { selectCurrentUserId, clearAuthError, clearAuthMessage, logoutUser } from "../parts/users/authSlice";
import { useAppDispatch } from "../app/store";
import { UnknownAction } from "@reduxjs/toolkit";

function NavbarHomePage({
  handleShowModal,
  setIsFormShow,
  isFormShow,
}: {
  handleShowModal: () => void;
  setIsFormShow: (value: boolean) => void;
  isFormShow: boolean;
}) {
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  const clearAlertsWithTimeout = (func: () => UnknownAction, delay: number) => {
    const timeoutId = setTimeout(() => {
      dispatch(func());
    }, delay);
    return () => clearTimeout(timeoutId);
  };

  const handleLogout = () => {
    try {
      dispatch(logoutUser());
      clearAlertsWithTimeout(clearAuthMessage, 3000);
    } catch (error) {
      console.error("Logout error:", error);
      clearAlertsWithTimeout(clearAuthError, 3000);
    }
  };

  const handleClick = () => {
    setIsFormShow(!isFormShow);
  };

  return (
    <Navbar expand="lg">
      <div className="w-100 p-3 m-0 d-flex justify-content-between">
        {currentUserId ? (
          <>
            <div>
              <img src="/logo.jpg" alt="logo" width={"50px"} height={"50px"} />
              <Button variant="link" className="text-primary-emphasis" onClick={handleLogout}>
                Выход
              </Button>
            </div>
            <Button
              variant="link"
              className=" text-primary-emphasis"
              id="add-product"
              active={isFormShow}
              onClick={handleClick}
            >
              Добавить
            </Button>
          </>
        ) : (
          <Button variant="link" className="text-primary-emphasis" onClick={handleShowModal}>
            Вход/регистрация
          </Button>
        )}
      </div>
    </Navbar>
  );
}

export default memo(NavbarHomePage);
