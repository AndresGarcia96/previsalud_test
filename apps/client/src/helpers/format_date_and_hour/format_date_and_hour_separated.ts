export const formatDateSeparate = (dateString?: string): string => {
  try {
    if (!dateString) {
      throw new Error("Date string is undefined or empty");
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

    const dateMatch = dateString.match(
      /^(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})/
    );
    if (!dateMatch) {
      throw new Error("Invalid date format");
    }

    const extractedDate = dateMatch[0];

    let year: string, month: string, day: string;

    if (extractedDate.includes("-")) {
      [year, month, day] = extractedDate.split("-");
    } else if (extractedDate.includes("/")) {
      [day, month, year] = extractedDate.split("/");
    } else {
      throw new Error("Invalid date format");
    }

    if (!year || !month || !day) {
      throw new Error("Invalid date parts");
    }

    const formattedMonth = months[parseInt(month, 10) - 1];

    if (!formattedMonth) {
      throw new Error("Invalid month");
    }

    return `${day} / ${formattedMonth} / ${year}`;
  } catch (error) {
    return "Fecha inválida";
  }
};

export const formatTimeSeparate = (timeString?: string): string => {
  try {
    if (!timeString) {
      throw new Error("Time string is undefined or empty");
    }

    const [hours, minutes, seconds] = timeString.split(":");

    if (!hours || !minutes || !seconds) {
      throw new Error("Invalid time format");
    }

    const hoursNumber = parseInt(hours, 10);

    if (isNaN(hoursNumber) || hoursNumber < 0 || hoursNumber > 23) {
      throw new Error("Invalid hour value");
    }

    const isPM = hoursNumber >= 12;
    const formattedHours = hoursNumber % 12 || 12;
    const meridian = isPM ? "p. m." : "a. m.";

    return `${formattedHours}:${minutes}:${seconds} ${meridian}`;
  } catch (error) {
    return "Hora inválida";
  }
};
