import "./ProductFilterBar.css";

export default function ProductFilterBar({
  searchQuery,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
}) {
  return (
    <div className="product-filter">
      <div className="product-filter__field">
        <label className="product-filter__label">Buscar produto</label>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nome do produto"
          className="product-filter__input"
        />
      </div>

      <div className="product-filter__field">
        <label className="product-filter__label">Filtrar por categoria</label>
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="product-filter__select"
        >
          <option value="">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
