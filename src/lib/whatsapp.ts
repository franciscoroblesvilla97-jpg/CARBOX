export const TELEFONO_CARBOX = "+56982106659";

export function whatsappUrl(mensaje: string, telefono: string = TELEFONO_CARBOX) {
  return `https://wa.me/${telefono.replace("+", "")}?text=${encodeURIComponent(mensaje)}`;
}
