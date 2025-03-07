import { memo } from "react";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { selectCurrentUserId, clearAuthError, clearAuthMessage, logoutUser } from "../parts/users/authSlice";
import { useAppDispatch } from "../app/store";
import { UnknownAction } from "@reduxjs/toolkit";

function NavbarHomePage({ handleShowModal }: { handleShowModal: () => void }) {
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
      localStorage.removeItem("category");
      clearAlertsWithTimeout(clearAuthMessage, 3000);
    } catch (error) {
      console.error("Logout error:", error);
      clearAlertsWithTimeout(clearAuthError, 3000);
    }
  };

  return (
    <Navbar expand="lg">
      <div className="w-100 m-0  d-flex align-items-center justify-content-between">
        <div className="logo d-flex justify-content-start" style={{ width: "140px" }}>
          <div className="text-center ps-2">
            <img src="/logo.jpg" alt="logo" width={"50px"} height={"50px"} className="mb-1" />
            <p className="text-dark-emphasis m-0">{window.location.hostname}</p>
          </div>
        </div>

        <h1 className="text-center m-0 text-primary-emphasis">Список покупок</h1>

        <div className="exit-btn text-end" style={{ width: "140px" }}>
          {currentUserId ? (
            <Button variant="link" className="text-dark-emphasis" onClick={handleLogout}>
              Выход
            </Button>
          ) : (
            <Button variant="link" className="text-dark-emphasis text-end" onClick={handleShowModal}>
              Вход/регистрация
            </Button>
          )}
        </div>
      </div>
    </Navbar>
  );
}

export default memo(NavbarHomePage);
