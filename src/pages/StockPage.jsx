import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import ProductFormModal from "../components/products/ProductFormModal.jsx";
import StockFormModal from "../components/stock/StockFormModal.jsx";
import StockTable from "../components/stock/StockTable.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useProducts from "../hooks/useProducts.jsx";
import useStockMovements from "../hooks/useStockMovements.jsx";
import { ROLE_ADMIN, normalizeRole } from "../utils/auth.js";
import { confirmDelete, confirmEditSave } from "../utils/confirmAction.js";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function getStock(product) {
  return Number(product.stockQuantity ?? product.stock ?? product.quantity ?? 0);
}

function getMinimum(product) {
  return Number(product.minimumStock ?? product.minStock ?? 0);
}

function getPatrimony(product) {
  return getStock(product) * Number(product.salePrice ?? 0);
}

export default function StockPage() {
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === ROLE_ADMIN;

  const {
    products,
    loading: loadingProducts,
    submitting: productSubmitting,
    error: productError,
    success: productSuccess,
    categories,
    lowStockCount,
    refetch: refetchProducts,
    createItem,
    updateItem,
    removeItem,
    clearError: clearProductError,
    clearSuccess: clearProductSuccess,
  } = useProducts();

  const {
    movements,
    loading: loadingMovements,
    submitting: movementSubmitting,
    error: movementError,
    success: movementSuccess,
    totalMovements,
    createMovement,
    refetch: refetchMovements,
    clearError: clearMovementError,
    clearSuccess: clearMovementSuccess,
  } = useStockMovements();

  const [activeTab, setActiveTab] = useState("products");
  const [productSearch, setProductSearch] = useState("");
  const [movementSearch, setMovementSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const category = String(product.category || "Sem categoria").toLowerCase();

      const matchesSearch =
        normalizedQuery === "" ||
        name.includes(normalizedQuery) ||
        category.includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "" || category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [productSearch, products, selectedCategory]);

  const filteredMovements = useMemo(() => {
    const normalizedQuery = movementSearch.trim().toLowerCase();

    return movements.filter((movement) => {
      const productName = String(movement.product?.name || movement.productName || "").toLowerCase();
      const reason = String(movement.reason || "").toLowerCase();
      const type = String(movement.type || "").toLowerCase();

      return (
        normalizedQuery === "" ||
        productName.includes(normalizedQuery) ||
        reason.includes(normalizedQuery) ||
        type.includes(normalizedQuery)
      );
    });
  }, [movementSearch, movements]);

  const patrimony = useMemo(
    () => filteredProducts.reduce((sum, product) => sum + getPatrimony(product), 0),
    [filteredProducts],
  );

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
    clearProductError();
    clearProductSuccess();
  };

  const handleProductSubmit = async (data) => {
    if (editingProduct?.id) {
      if (!confirmEditSave(`o produto "${editingProduct.name}"`)) return;
      await updateItem(editingProduct.id, data);
    } else {
      await createItem(data);
    }

    closeProductModal();
  };

  const handleMovementSubmit = async (data) => {
    try {
      await createMovement(data);
      setMovementModalOpen(false);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Estoque
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => {
                refetchProducts();
                refetchMovements();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>

            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                >
                  <Package className="h-4 w-4" />
                  Produto
                </button>
                <button
                  type="button"
                  onClick={() => setMovementModalOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#6d4cad] px-4 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" />
                  Movimento
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "products"
                ? "bg-[#6d4cad] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            <Package className="h-4 w-4" />
            Produtos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("movements")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "movements"
                ? "bg-[#6d4cad] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Movimentacoes
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-200 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {activeTab === "products" ? (
              <>
                <span className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
                  {filteredProducts.length} produto(s)
                </span>
                <span>{lowStockCount} com estoque baixo</span>
                <span>Patrimonio: {formatCurrency(patrimony)}</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 font-semibold text-[#6d4cad]">
                  {filteredMovements.length} movimentacao(oes)
                </span>
                <span>{totalMovements} registro(s) total(is)</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            {activeTab === "products" ? (
              <>
                <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[320px]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Buscar produto ou categoria"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </label>

                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-500 lg:w-[320px]">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  type="search"
                  value={movementSearch}
                  onChange={(event) => setMovementSearch(event.target.value)}
                  placeholder="Buscar movimentacao"
                  className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
            )}
          </div>
        </div>

        {productError ? <div className="px-5 pt-5"><StatusBanner type="error" title="Erro em produtos" message={productError} /></div> : null}
        {productSuccess ? <div className="px-5 pt-5"><StatusBanner type="success" title="Produtos" message={productSuccess} /></div> : null}
        {movementError ? <div className="px-5 pt-5"><StatusBanner type="error" title="Erro em estoque" message={movementError} /></div> : null}
        {movementSuccess ? <div className="px-5 pt-5"><StatusBanner type="success" title="Estoque" message={movementSuccess} /></div> : null}

        {activeTab === "products" ? (
          loadingProducts ? (
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-5 py-8">
              <EmptyState
                eyebrow="Sem produtos"
                title="Nenhum produto encontrado"
                description="Cadastre produtos novos ou ajuste os filtros para continuar."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[2fr_1fr_0.9fr_0.9fr_1fr_0.8fr_1fr] border-b border-slate-200 bg-[#f8fafc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Produto</span>
                  <span>Categoria</span>
                  <span>Venda</span>
                  <span>Estoque</span>
                  <span>Patrimonio</span>
                  <span>Detalhes</span>
                  <span className="text-right">Acoes</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {filteredProducts.map((product) => {
                    const isOpen = expandedProductId === product.id;
                    const stock = getStock(product);
                    const minimum = getMinimum(product);
                    const stockTone =
                      minimum > 0 && stock <= minimum
                        ? "bg-rose-100 text-rose-700"
                        : stock === 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700";

                    return (
                      <div key={product.id ?? product.name}>
                        <div className="grid grid-cols-[2fr_1fr_0.9fr_0.9fr_1fr_0.8fr_1fr] items-center px-5 py-4 text-sm text-slate-600 transition hover:bg-[#fafbfe]">
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                          </div>
                          <span>{product.category || "Sem categoria"}</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(product.salePrice)}</span>
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${stockTone}`}>
                            {stock} item(ns)
                          </span>
                          <span className="font-semibold text-slate-900">{formatCurrency(getPatrimony(product))}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedProductId((current) => (current === product.id ? null : product.id))}
                            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {isOpen ? "Ocultar" : "Exibir"}
                          </button>
                          <div className="flex justify-end gap-2">
                            {isAdmin ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductModalOpen(true);
                                  }}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#6d4cad] transition hover:border-[#6d4cad]/20"
                                  title="Editar produto"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirmDelete(`o produto "${product.name}"`)) return;
                                    await removeItem(product.id);
                                  }}
                                  disabled={productSubmitting}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Remover produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {isOpen ? (
                          <div className="grid gap-3 border-t border-slate-100 bg-[#fcfcfe] px-5 py-4 text-sm text-slate-600 md:grid-cols-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Descricao</p>
                              <p className="mt-2 leading-6">{product.description || "Sem descricao cadastrada."}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Compra</p>
                              <p className="mt-2 font-semibold text-slate-900">{formatCurrency(product.purchasePrice)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Estoque minimo</p>
                              <p className="mt-2 font-semibold text-slate-900">{minimum} item(ns)</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        ) : loadingMovements ? (
          <div className="space-y-3 px-5 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <StockTable movements={filteredMovements} />
          </div>
        )}
      </section>

      {isAdmin ? (
        <>
          <ProductFormModal
            open={productModalOpen}
            onClose={closeProductModal}
            onSubmit={handleProductSubmit}
            submitting={productSubmitting}
            initialData={editingProduct}
          />
          <StockFormModal
            open={movementModalOpen}
            onClose={() => {
              setMovementModalOpen(false);
              clearMovementError();
              clearMovementSuccess();
            }}
            onSubmit={handleMovementSubmit}
            products={products}
            submitting={movementSubmitting}
          />
        </>
      ) : null}
    </div>
  );
}
