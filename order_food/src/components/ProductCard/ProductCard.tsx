import styles from "./ProductCard.module.css";
import { ProductCardProps } from "./ProductCard.props";
import { Link } from "react-router-dom";

function ProductCard(props: ProductCardProps) {
  return (
    <Link to={`/product/${props.id}`} className={styles["link"]}>
      <div className={styles["card"]}>
        <div
          className={styles["head"]}
          style={{ backgroundImage: `url(${props.image})` }}
        >
          <div className={styles["price"]}>
            {props.price}&nbsp;
            <span className={styles["currency"]}>UAN</span>
          </div>
          <button className={styles["add-to-cart"]}>
            <img src="/button_cart-icon.svg" alt="add to cart icon" />
          </button>
          <div className={styles["rating"]}>
            {props.rating}&nbsp;
            <img src="/star-icon.svg" alt="star icon" />
          </div>
        </div>
        <div className={styles["footer"]}>
          <div className={styles["title"]}>{props.title}</div>
          <div className={styles["description"]}>{props.description}</div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
