export const formatCurrencyVES = (amount) => {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
  }).format(amount);
};

export const formatCurrencyUSD = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatCartItemSubtotal = (price, quantity) => {
  return price * quantity;
};
