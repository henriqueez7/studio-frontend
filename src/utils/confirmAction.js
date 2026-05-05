export function confirmEditSave(itemLabel = "este item") {
  return window.confirm(`Tem certeza que deseja salvar a alteração em ${itemLabel}?`);
}

export function confirmDelete(itemLabel = "este item") {
  return window.confirm(`Tem certeza que deseja excluir ${itemLabel}?`);
}
