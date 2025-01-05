import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useEffect, useRef, useState, memo } from "react";
import { useSelector } from "react-redux";
import { ProductType, fetchProducts, selectAllProducts, deleteProduct } from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import ProductItem from "./ProductItem";
import CategoriesList from "../categories/CategoriesList";
import { selectCurrentUserId } from "../users/authSlice";
import { selectUserById, UserType, fetchUsers } from "../users/usersSlice";

const ProductsList = () => {
  const [productsList, setProductsList] = useState<ProductType[]>([]);
  const products: ProductType[] = useSelector(selectAllProducts);
  const dispatch = useAppDispatch();
  const dataFetch = useRef<boolean>(false);
  const productStatus = useSelector(
    (state: { products: { status: "idle" | "loading" | "succeeded" | "failed" } }) => state.products.status
  );
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const currentUser = useSelector((state: { users: { users: UserType[] } }) =>
    selectUserById(state, currentUserId as number)
  );
  const categories = currentUser?.categories;

  const [selectedCategory, setSelectedCategory] = useState<string>(
    localStorage.getItem("category") ? JSON.parse(localStorage.getItem("category") as string) : "Все"
  );
  const sortedList = [...productsList].sort((a, b) => +a.checked - +b.checked);
  const filteredList = sortedList.filter((product) => product.category === selectedCategory);

  useEffect(() => {
    async function selectUsers() {
      await dispatch(fetchUsers()).unwrap();
    }
    selectUsers();
  }, [dispatch]);

  useEffect(() => {
    if (dataFetch.current) return;
    dataFetch.current = true;

    dispatch(fetchProducts(currentUserId as number)).unwrap();
  }, [dispatch, productStatus, currentUserId]);

  useEffect(() => {
    if (Array.isArray(products)) {
      setProductsList(products);
    }
  }, [products]);

  const handleClearList = () => {
    for (const product of productsList) {
      if (product.checked) {
        dispatch(deleteProduct(product.id as number)).unwrap();
      }
    }
  };

  return (
    <div className="products-list w-100">
      <h1 className="text-center mb-3 text-primary-emphasis">Список покупок</h1>
      <ButtonGroup className="relative w-100 mb-3">
        <CategoriesList category={selectedCategory} setCategory={setSelectedCategory} isFirstElement={false} />
        <Button
          variant="link"
          className="rounded ms-1 text-primary-emphasis z-1"
          onClick={handleClearList}
          style={{ position: "absolute", right: "0" }}
        >
          Очистить список
        </Button>
      </ButtonGroup>

      {sortedList.length === 0 && <p className="text-center">Список покупок пуст...</p>}
      <ListGroup>
        {categories?.map((category) => (
          <div key={category}>
            {selectedCategory === "Все" ? (
              <>
                {sortedList.some((product) => product.category === category) && (
                  <h5 className="text-primary-emphasis">{category}</h5>
                )}
                {sortedList
                  .filter((product) => product.category === category)
                  .map((product) => (
                    <ProductItem key={product.id} product={product} setProductsList={setProductsList} />
                  ))}
              </>
            ) : (
              <>
                {selectedCategory === category && <h3>{category}</h3>}{" "}
                {filteredList
                  .filter((product) => product.category === category)
                  .map((product) => (
                    <ProductItem key={product.id} product={product} setProductsList={setProductsList} />
                  ))}
              </>
            )}
          </div>
        ))}
        {filteredList.length === 0 && selectedCategory !== "Все" && <p className="text-center">Ничего не найдено...</p>}
      </ListGroup>
    </div>
  );
};

export default memo(ProductsList);
