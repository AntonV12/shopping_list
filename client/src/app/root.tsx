import { useState, useEffect } from "react";
import ModalForm from "../parts/users/ModalForm";
import Alerts from "../parts/Alerts";
import NavbarHomePage from "../parts/Navbar";
import { fetchCurrentUser, selectCurrentUserId } from "../parts/users/authSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "./store";
import ProductsList from "../parts/products/ProductsList";
import ProductsSyncButton from "../parts/products/ProductsSyncButton";

function Root() {
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const currentUserId = useSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();
  const authStatus = useSelector((state: { auth: { status: string } }) => state.auth.status);

  useEffect(() => {
    if (!currentUserId) {
      dispatch(fetchCurrentUser());
    }
  }, [currentUserId, dispatch]);

  const handleShowModal = () => setIsModalShow(true);
  const handleCloseModal = () => setIsModalShow(false);

  return (
    <div id="wrapper" className="d-flex flex-column">
      <header className="mb-3">
        <NavbarHomePage handleShowModal={handleShowModal} />
      </header>

      <div className="container position-relative flex-grow-1">
        <main className="d-flex flex-column justify-content-center align-items-center w-100">
          {!currentUserId ? (
            <section>
              <p className="text-dark-emphasis mt-3">
                Сервис для управления семейным списком покупок. Вы можете разделить свой список покупок на категории.
                Общий аккаунт для всей семьи позволит планировать покупки. Просто добавьте товары в желаемую категорию и
                вся семья будет знать, что нужно купить.
              </p>
            </section>
          ) : (
            <>
              {authStatus === "loading" && <p>Загрузка...</p>}
              <ProductsList />
            </>
          )}

          <ProductsSyncButton />
        </main>

        <Alerts />
        {isModalShow && <ModalForm isModalShow={isModalShow} handleCloseModal={handleCloseModal} />}
      </div>
      <footer className="text-dark-emphasis">2025 &copy; AntonV</footer>
    </div>
  );
}

export default Root;
