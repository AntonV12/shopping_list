import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { useEffect, useRef, useState, memo } from "react";
import { useSelector } from "react-redux";
import {
  ProductType,
  fetchProducts,
  selectAllProducts,
  deleteProduct,
  addProduct,
  updateProducts,
} from "./productsSlice";
import { useAppDispatch } from "../../app/store";
import ProductItem from "./ProductItem";
import CategoriesList from "../categories/CategoriesList";
import { selectCurrentUserId } from "../users/authSlice";
import { selectUserById, UserType, fetchUsers } from "../users/usersSlice";
import NewProductForm from "./NewProductForm";

const ProductsList = () => {
  const [productsList, setProductsList] = useState<ProductType[]>([]);
  const products: ProductType[] = useSelector(selectAllProducts);
  const dispatch = useAppDispatch();
  const dataFetch = useRef<boolean>(false);
  // const productStatus = useSelector(
  //   (state: { products: { status: "idle" | "loading" | "succeeded" | "failed" } }) => state.products.status
  // );
  const currentUserId: number | null = useSelector(selectCurrentUserId);
  const currentUser = useSelector((state: { users: { users: UserType[] } }) =>
    selectUserById(state, currentUserId as number)
  );
  //const categories = currentUser?.categories;
  const [categories, setCategories] = useState<string[]>(currentUser?.categories || []);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    localStorage.getItem("category") ? JSON.parse(localStorage.getItem("category") as string) : "Все"
  );
  const sortedList = [...productsList].sort((a, b) => +a.checked - +b.checked);
  const filteredList = sortedList.filter((product) => product.category === selectedCategory);
  /*  const productsStatus = useSelector(
    (state: { products: { status: "idle" | "loading" | "succeeded" | "failed" } }) => state.products.status
  ); */

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
  }, [dispatch, currentUserId]);

  useEffect(() => {
    if (products.length === 0) return;

    const savedProducts: ProductType[] = JSON.parse(localStorage.getItem("savedProducts") as string) || [];
    const deletedProducts: ProductType[] =
      JSON.parse(localStorage.getItem("deletedProducts") as string) || [];

    if (deletedProducts.length > 0) {
      deletedProducts.forEach((product) => dispatch(deleteProduct(product.id as number)));
      localStorage.removeItem("deletedProducts");
    }

    const updatedProducts: ProductType[] = [
      ...products.filter((product) => !deletedProducts.some((p) => p.id === product.id)),
    ];

    if (savedProducts.length > 0) {
      savedProducts.forEach((product) => {
        const index = updatedProducts.findIndex((p) => p.id === product.id);
        if (index === -1) {
          updatedProducts.push(product);
          dispatch(addProduct(product));
        } else {
          updatedProducts[index] = product;
          dispatch(updateProducts({ products: updatedProducts }));
        }
      });

      localStorage.removeItem("savedProducts");
      setProductsList(updatedProducts);
    } else {
      setProductsList(products);
    }
  }, [products, dispatch]);

  const handleClearList = async () => {
    const confirm = window.confirm("Вы уверены, что хотите очистить список?");
    if (!confirm) return;

    const updatedProducts = productsList.filter((product) => !product.checked);
    const deletedProducts = productsList.filter((product) => product.checked);
    await Promise.all(deletedProducts.map((product) => dispatch(deleteProduct(product.id as number))));
    setProductsList(updatedProducts);
  };

  return (
    <div className="products-list w-100">
      <CategoriesList
        category={selectedCategory}
        setCategory={setSelectedCategory}
        categories={categories}
        setCategories={setCategories}
        isFirstElement={false}
        setProductsList={setProductsList}
      />

      {sortedList.length === 0 && selectedCategory === "Все" && (
        <p className="text-center">Список покупок пуст...</p>
      )}
      <ListGroup className="mb-3">
        {categories?.map((category) => (
          <div key={category}>
            {selectedCategory === "Все" ? (
              <>
                {sortedList.some((product) => product.category === category) && (
                  <h5 className="text-primary-emphasis mt-2">{category}</h5>
                )}
                {sortedList
                  .filter((product) => product.category === category)
                  .map((product) => (
                    <ProductItem key={product.id} product={product} setProductsList={setProductsList} />
                  ))}
              </>
            ) : (
              <>
                {filteredList
                  .filter((product) => product.category === category)
                  .map((product) => (
                    <ProductItem key={product.id} product={product} setProductsList={setProductsList} />
                  ))}
              </>
            )}
          </div>
        ))}
        {filteredList.length === 0 && selectedCategory !== "Все" && (
          <p className="text-center">Ничего не найдено...</p>
        )}
      </ListGroup>

      {selectedCategory !== "Все" ? (
        <NewProductForm setProductsList={setProductsList} products={products} />
      ) : (
        <p className="mt-3 text-secondary">Чтобы добавить продукт, выберите категорию</p>
      )}

      <div className="w-100 mb-3 text-end">
        <Button id="clear-btn" variant="link" className="text-dark-emphasis p-0" onClick={handleClearList}>
          Очистить список
        </Button>
      </div>
    </div>
  );
};

export default memo(ProductsList);
