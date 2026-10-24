// Upsell 1 (TSL do Conselheiro da Reconquista): o botão de compra é tratado pelo script da VendePay
// (compra em 1 clique, ver index.html). Aqui só o link de recusa [data-decline].
const upsellConfig = {
  // Para onde vai quem recusa: o próximo upsell.
  declineUrl: "../up2/",
};

const landingParams = new URLSearchParams(window.location.search);

// Leva adiante os parâmetros com que a pessoa chegou (UTMs, fbclid, dados do pedido).
// O que o link já tiver não é sobrescrito.
function withParams(href) {
  const url = new URL(href, window.location.href);
  landingParams.forEach((value, key) => {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  });
  return url.toString();
}

document.querySelectorAll("[data-decline]").forEach((link) => {
  link.href = withParams(upsellConfig.declineUrl);
});
