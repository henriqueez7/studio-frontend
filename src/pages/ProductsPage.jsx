import { Plus, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "../components/products/ProductCard.jsx";
import ProductFilterBar from "../components/products/ProductFilterBar.jsx";
import ProductFormModal from "../components/products/ProductFormModal.jsx";
import ProductSummaryCard from "../components/products/ProductSummaryCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import PageIntro from "../components/ui/PageIntro.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useProducts from "../hooks/useProducts.jsx";
import { ROLE_ADMIN, normalizeRole } from "../utils/auth.js";
import "./ProductsPage.css";

export default function ProductsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isAdmin = role === ROLE_ADMIN;

  const {
    products,
    loading,
    submitting,
    error,
    success,
    categories,
    lowStockCount,
    refetch,
    createItem,
    clearError,
    clearSuccess,
  } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const name = (
        product.name ||
        product.title ||
        product.productName ||
        ""
      ).toLowerCase();
      const category = (
        product.category ||
        product.type ||
        product.brand ||
        "Sem categoria"
      ).toLowerCase();

      const matchesName = query === "" || name.includes(query);
      const matchesCategory =
        selectedCategory === "" || category === selectedCategory.toLowerCase();

      return matchesName && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const closeModal = () => {
    setModalOpen(false);
    clearError();
    clearSuccess();
  };

  const handleCreate = async (data) => {
    await createItem(data);
    setModalOpen(false);
  };

  return (
    <div className="products-page">
      <PageHeader
        actions={
          <div className="products-panel__actions">
            <button
              type="button"
              onClick={refetch}
              className="products-button products-button--secondary"
            >
              <RefreshCcw className="products-button__icon" />
              Atualizar
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="products-button products-button--primary"
              >
                <Plus className="products-button__icon" />
                Adicionar produto
              </button>
            ) : null}
          </div>
        }
      >
        <PageIntro
          eyebrow="Produtos"
          title={
            isAdmin
              ? "Produtos com controle visual de estoque e pesquisa rápida."
              : "Produtos ativos disponíveis para consulta operacional."
          }
          description={
            isAdmin
              ? "O admin acompanha preços, categorias e níveis de estoque com um catálogo visual consistente."
              : "O barbeiro consulta produtos ativos para apoiar o atendimento e o controle operacional do studio."
          }
        />
      </PageHeader>

      <div className="products-summary-grid">
        <ProductSummaryCard
          title="Total de produtos"
          value={products.length}
          description="Quantidade total exibida no catálogo atual."
        />
        <ProductSummaryCard
          title="Estoque baixo"
          value={lowStockCount}
          description="Produtos com estoque igual ou abaixo do mínimo."
        />
        <ProductSummaryCard
          title="Categorias"
          value={categories.length}
          description="Categorias distintas identificadas no backend."
        />
      </div>

      {error ? (
        <StatusBanner type="error" title="Erro ao carregar produtos" message={error} />
      ) : null}

      {success ? (
        <StatusBanner type="success" title="Sucesso" message={success} />
      ) : null}

      <SectionCard className="products-results-panel">
        <SectionHeader
          eyebrow="Buscar e filtrar"
          title="Encontre produtos com precisão"
          aside={
            <div className="products-results__badge">
              {filteredProducts.length} produto(s) exibido(s)
            </div>
          }
        />

        <div className="products-filter-panel">
          <ProductFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            category={selectedCategory}
            categories={categories}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </SectionCard>

      <SectionCard className="products-results-panel">
        {loading ? (
          <div className="products-placeholder">
            <SkeletonBlock className="h-16" />
            <div className="products-card-grid">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-[22rem]" lines={3} />
              ))}
            </div>
          </div>
        ) : error ? (
          <ErrorState
            title="Falha ao carregar produtos"
            message={error}
            onAction={refetch}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            eyebrow="Sem resultados"
            title="Nenhum produto encontrado"
            description="Ajuste a busca ou selecione outra categoria para ver produtos."
          />
        ) : (
          <div className="products-card-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id ?? product._id ?? product.sku ?? product.name}
                product={product}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {isAdmin ? (
        <ProductFormModal
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}
