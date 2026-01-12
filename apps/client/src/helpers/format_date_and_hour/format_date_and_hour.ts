export const formatDate = (dateString: string | undefined) => {
  if (dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("es-CO");
  }

  return "NO REGISTRA";
};

export const formatTime = (dateString: string | undefined) => {
  if (dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("es-CO", { hour12: true });
  }

  return "NO REGISTRA";
};
