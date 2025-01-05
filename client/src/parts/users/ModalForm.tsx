import { memo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import { clearUserError, clearUserMessage } from "./usersSlice";
import { useAppDispatch } from "../../app/store";
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";

function ModalForm({ isModalShow, handleCloseModal }: { isModalShow: boolean; handleCloseModal: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("loginUser");
  const dispatch = useAppDispatch();

  const clearAlerts = () => {
    dispatch(clearUserError());
    dispatch(clearUserMessage());
  };

  return (
    <div className="modal show">
      <Modal
        show={isModalShow}
        onHide={() => {
          handleCloseModal();
          clearAlerts();
        }}
        className="modal-window mt-5"
      >
        <Modal.Header closeButton>
          <Nav
            variant="tabs"
            defaultActiveKey="loginUser"
            activeKey={activeTab}
            onSelect={(selectedKey) => selectedKey && setActiveTab(selectedKey)}
          >
            <Nav.Item>
              <Nav.Link eventKey="loginUser" id="loginUser" className="text-primary-emphasis">
                Вход
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="registerUser" id="registerUser" className="text-primary-emphasis">
                Регистрация
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Modal.Header>
        {activeTab === "registerUser" ? (
          <SignUpForm handleCloseModal={handleCloseModal} />
        ) : (
          <LoginForm handleCloseModal={handleCloseModal} />
        )}
      </Modal>
    </div>
  );
}

export default memo(ModalForm);
