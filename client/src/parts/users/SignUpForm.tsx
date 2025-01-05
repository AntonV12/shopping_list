import { memo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useSelector } from "react-redux";
import { registerUser, UserType, clearUserError, clearUserMessage, resetUserStatus, statusType } from "./usersSlice";
import { useAppDispatch } from "../../app/store";

const initialCategories = ["Все", "Продукты", "Промтовары", "Одежда"];

function SignUpForm({ handleCloseModal }: { handleCloseModal: () => void }) {
  const [validated, setValidated] = useState<boolean>(false);
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();
  const error = useSelector(
    (state: { users: { error: string | null }; auth: { error: string | null } }) =>
      state.users.error || state.auth.error
  );

  const usersStatus: statusType = useSelector((state: { users: { status: statusType } }) => state.users.status);

  const clearAlerts = () => {
    dispatch(clearUserError());
    dispatch(clearUserMessage());
  };

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form: HTMLFormElement = event.currentTarget;

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);

    clearAlerts();
    try {
      if (login.trim() !== "" && password.trim() !== "") {
        const newUser: UserType = {
          id: null,
          login: login,
          password: password,
          categories: initialCategories,
        };

        await dispatch(registerUser(newUser)).unwrap();
        dispatch(resetUserStatus());
        handleCloseModal();

        const timeoutId = setTimeout(() => {
          clearAlerts();
        }, 3000);
        return () => clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error("Failed to save user: ", err);
      setValidated(false);
    }
  };

  const handleFocus = () => {
    clearAlerts();
    setValidated(true);
  };

  return (
    <div>
      <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-3">
        <Row className="mb-3">
          <Form.Group controlId="login">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Логин"
              value={login}
              onChange={handleLoginChange}
              onFocus={handleFocus}
              isInvalid={error === "Пользователь уже существует" || error === "Пользователь не найден" ? true : false}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group controlId="password">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              required
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={handlePasswordChange}
              pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$"
              onFocus={handleFocus}
              isInvalid={error === "Неверный пароль" ? true : false}
            />
            <Form.Control.Feedback type="invalid">
              {error
                ? error
                : "Пароль должен содержать минимум 8 символов, одну заглавную букву, одну строчную букву и одну цифру"}
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Button
          type="submit"
          variant="light"
          className="bg-gradient bg-dark-subtle text-primary-emphasis"
          disabled={usersStatus === "loading"}
        >
          {usersStatus === "loading" ? "Загрузка..." : "Отправить"}
        </Button>
      </Form>
    </div>
  );
}

export default memo(SignUpForm);
