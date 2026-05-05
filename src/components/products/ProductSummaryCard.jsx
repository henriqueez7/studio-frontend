import "./ProductSummaryCard.css";

export default function ProductSummaryCard({ title, value, description }) {
  return (
    <div className="product-summary-card">
      <p className="product-summary-card__title">{title}</p>
      <p className="product-summary-card__value">{value}</p>
      <p className="product-summary-card__description">{description}</p>
    </div>
  );
}
