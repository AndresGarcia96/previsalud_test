import dayjs from "dayjs";

export const formatDate = (dateString: string): string => {
  try {
    const months = [
      "Ene.",
      "Feb.",
      "Mar.",
      "Abr.",
      "May.",
      "Jun.",
      "Jul.",
      "Ago.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dic.",
    ];

    const [datePart, timePart] = dateString.split(", ");
    const [day, month, year] = datePart.split("/");

    const formattedMonth = months[parseInt(month, 10) - 1];

    if (!formattedMonth) {
      throw new Error("Invalid month");
    }

    return `${day} / ${formattedMonth} / ${year} - ${timePart}`;
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "Fecha inválida";
  }
};

export const formatDateInDatePicker = (
  dateString: dayjs.Dayjs | string | undefined
): string => {
  try {
    if (dateString === undefined) {
      return "NO REGISTRA";
    }
    const months = [
      "Ene.",
      "Feb.",
      "Mar.",
      "Abr.",
      "May.",
      "Jun.",
      "Jul.",
      "Ago.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dic.",
    ];

    const dateToParse = Array.isArray(dateString) ? dateString[0] : dateString;

    const parsedDate = dayjs(dateToParse, "DD-MM-YYYY");

    if (!parsedDate.isValid()) throw new Error("Invalid date");

    const day = parsedDate.date();
    const month = months[parsedDate.month()];
    const year = parsedDate.year();

    return `${day} / ${month} / ${year}`;
  } catch (error) {
    console.error("Error in formatDate:", error);

    return "Fecha inválida";
  }
};

export const convertToDayjs = (
  dateInput: string | Date | null | undefined
): dayjs.Dayjs | undefined => {
  if (!dateInput) return undefined;

  if (dateInput instanceof Date) {
    return dayjs(dateInput);
  }

  // Caso común ISO (2025-05-30)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dayjs(dateInput);
  }

  // Caso personalizado tipo "03 / May. / 2025"
  const months: Record<string, number> = {
    "Ene.": 0,
    "Feb.": 1,
    "Mar.": 2,
    "Abr.": 3,
    "May.": 4,
    "Jun.": 5,
    "Jul.": 6,
    "Ago.": 7,
    "Sep.": 8,
    "Oct.": 9,
    "Nov.": 10,
    "Dic.": 11,
  };

  const parts = dateInput.split(" / ").map((p) => p.trim());

  if (parts.length !== 3) {
    console.error("Formato incorrecto, no tiene 3 partes");
    return undefined;
  }

  let [day, month, year] = parts;
  const dayNumber = parseInt(day, 10);
  const yearNumber = parseInt(year, 10);

  if (!months.hasOwnProperty(month)) {
    console.error("Mes inválido:", month);
    return undefined;
  }

  const monthNumber = months[month];

  const parsedDate = dayjs(new Date(yearNumber, monthNumber, dayNumber));
  return parsedDate.isValid() ? parsedDate : undefined;
};
