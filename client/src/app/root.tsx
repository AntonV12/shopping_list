import { useState, useEffect } from "react";
import ModalForm from "../parts/users/ModalForm";
import Alerts from "../parts/Alerts";
import NavbarHomePage from "../parts/Navbar";
import { fetchCurrentUser, selectCurrentUserId } from "../parts/users/authSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "./store";
import NewProductForm from "../parts/products/NewProductForm";
import ProductsList from "../parts/products/ProductsList";
import { Button } from "react-bootstrap";

function Root() {
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const [isFormShow, setIsFormShow] = useState<boolean>(false);
  const currentUserId = useSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentUserId) {
      dispatch(fetchCurrentUser());
    }
  }, [currentUserId, dispatch]);

  const handleShowModal = () => setIsModalShow(true);
  const handleCloseModal = () => setIsModalShow(false);

  const handleClick = () => {
    setIsFormShow(!isFormShow);
  };

  return (
    <div id="wrapper">
      <header>
        <NavbarHomePage handleShowModal={handleShowModal} isFormShow={isFormShow} setIsFormShow={setIsFormShow} />
      </header>

      <main className="d-flex flex-column justify-content-center align-items-center w-100 p-3">
        {!currentUserId ? (
          <h1>Пожалуйста, авторизуйтесь</h1>
        ) : (
          <>
            <ProductsList />
            <Button
              variant="link"
              className=" text-primary-emphasis ms-auto"
              id="add-product"
              active={isFormShow}
              onClick={handleClick}
            >
              Добавить
            </Button>
            {isFormShow && <NewProductForm />}
          </>
        )}
      </main>

      <Alerts />
      {isModalShow && <ModalForm isModalShow={isModalShow} handleCloseModal={handleCloseModal} />}
    </div>
  );
}

export default Root;
