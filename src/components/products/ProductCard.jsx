import { DollarSign, Package, Tag } from "lucide-react";
import "./ProductCard.css";

function formatCurrency(value) {
  const number = typeof value === "string" ? Number(value) : value;
  if (Number.isFinite(number)) {
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  return "R$ 0,00";
}

export default function ProductCard({ product }) {
  const name =
    product.name || product.title || product.productName || "Produto";
  const category =
    product.category || product.type || product.brand || "Sem categoria";
  const salePrice = product.salePrice ?? product.price ?? product.value;
  const stock = Number(
    product.stockQuantity ?? product.stock ?? product.quantity ?? 0,
  );
  const minimumStock = Number(product.minimumStock ?? product.minStock ?? 0);
  const lowStock = minimumStock > 0 && stock <= minimumStock;
  const revenue =
    product.revenue ?? product.expectedRevenue ?? Number(salePrice) * stock;

  return (
    <article
      className={`product-card${lowStock ? " product-card--low-stock" : ""}`}
    >
      <div className="product-card__header">
        <div className="min-w-0">
          <p className="product-card__label">Produto</p>
          <h3 className="product-card__name">{name}</h3>
        </div>
        <div className="product-card__tag">
          <Package />
        </div>
      </div>

      <div className="product-card__meta-list">
        <div className="product-card__meta-item">
          <Tag />
          <span className="product-card__meta-text">{category}</span>
        </div>
        <div className="product-card__meta-item">
          <DollarSign />
          <span className="product-card__meta-text">{formatCurrency(salePrice)}</span>
        </div>
      </div>

      <div className="product-card__stats">
        <div className="product-card__stat">
          <p>Estoque</p>
          <strong>{stock}</strong>
        </div>
        <div className="product-card__stat">
          <p>Minimo</p>
          <strong>{minimumStock}</strong>
        </div>
        <div className="product-card__stat">
          <p>Valor em estoque</p>
          <strong>{formatCurrency(revenue)}</strong>
        </div>
      </div>

      <div className="product-card__footer">
        <p>Status de estoque</p>
        <span
          className={`product-card__status${
            lowStock ? " product-card__status--low-stock" : ""
          }`}
        >
          {lowStock ? "Estoque baixo" : "Estoque saudavel"}
        </span>
      </div>
    </article>
  );
}
