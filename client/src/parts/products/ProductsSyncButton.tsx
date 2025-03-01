import { useAppDispatch } from "../../app/store";
import { useSelector } from "react-redux";
import { fetchProducts, ProductType } from "./productsSlice";
import { selectCurrentUserId } from "../users/authSlice";
import { fetchUsers, UserType } from "../users/usersSlice";
import Button from "react-bootstrap/Button";
import { useState, useRef } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const ProductsSyncButton = ({
  setSelectedCategory,
  setProductsList,
  setCategories,
}: {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setProductsList: React.Dispatch<React.SetStateAction<ProductType[]>>;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const dispatch = useAppDispatch();
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const [requestStatus, setRequestStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const ref = useRef<SVGSVGElement>(null);

  const handleSync = async () => {
    try {
      setRequestStatus("pending");
      if (ref.current) {
        ref.current.style.animation = "spin 1s linear infinite";
      }

      if (currentUserId) {
        const newUsers: UserType[] = await dispatch(fetchUsers()).unwrap();
        const newProducts: ProductType[] = await dispatch(fetchProducts(currentUserId)).unwrap();
        setCategories(newUsers.find((user) => user.id === currentUserId)?.categories || []);
        setProductsList(newProducts);

        const updatedCategories: string[] =
          (await dispatch(fetchUsers()).unwrap()).find((user) => user.id === currentUserId)?.categories || [];

        const selectedCategory: string = JSON.parse(localStorage.getItem("category") ?? "");

        if (!updatedCategories.includes(selectedCategory)) {
          setSelectedCategory("Все");
          localStorage.setItem("category", JSON.stringify("Все"));
        } else {
          setSelectedCategory(selectedCategory);
          localStorage.setItem("category", JSON.stringify(selectedCategory));
        }
      }

      setRequestStatus("success");
    } catch (err) {
      console.error(err);
      setRequestStatus("failed");
    } finally {
      setRequestStatus("idle");
      if (ref.current) {
        ref.current.style.animation = "none";
        ref.current.style.transform = "rotate(0deg)";
      }
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="tooltip-top" style={{ textAlign: "center", width: "200px" }}>
            {requestStatus === "pending" ? "Загрузка..." : "Синхронизация с сервером"}
          </Tooltip>
        }
      >
        <Button variant="none" className="reload-btn" onClick={handleSync} disabled={requestStatus === "pending"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            fill="currentColor"
            className="bi bi-arrow-clockwise"
            viewBox="0 0 16 16"
            ref={ref}
          >
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
          </svg>
        </Button>
      </OverlayTrigger>
    </>
  );
};

export default ProductsSyncButton;
