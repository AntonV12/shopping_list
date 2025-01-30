import { useState, useEffect } from "react";
import ModalForm from "../parts/users/ModalForm";
import Alerts from "../parts/Alerts";
import NavbarHomePage from "../parts/Navbar";
import { fetchCurrentUser, selectCurrentUserId } from "../parts/users/authSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "./store";
import ProductsList from "../parts/products/ProductsList";

function Root() {
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const currentUserId = useSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!currentUserId) {
      dispatch(fetchCurrentUser());
    }
  }, [currentUserId, dispatch]);

  const handleShowModal = () => setIsModalShow(true);
  const handleCloseModal = () => setIsModalShow(false);

  return (
    <div id="wrapper" className="d-flex flex-column">
      <header>
        <NavbarHomePage handleShowModal={handleShowModal} />
      </header>

      <div className="container position-relative flex-grow-1">
        <main className="d-flex flex-column justify-content-center align-items-center w-100">
          {!currentUserId ? (
            <section>
              <h1 className="mb-3">Пожалуйста, авторизуйтесь</h1>
              <br />
              <h3 className="text-dark-emphasis mt-3">Описание данного сервиса</h3>
              <p className="text-dark-emphasis">
                Сервис для управления семейным списком покупок. Вы можете разделить свой список покупок на категории.
                Просто добавьте товары в желаемую категорию и поделитесь своим списком с членами семьи.
              </p>
            </section>
          ) : (
            <>
              <ProductsList />
            </>
          )}
        </main>

        <Alerts />
        {isModalShow && <ModalForm isModalShow={isModalShow} handleCloseModal={handleCloseModal} />}
      </div>
      <footer className="text-dark-emphasis">2025 &copy; AntonV</footer>
    </div>
  );
}

export default Root;
