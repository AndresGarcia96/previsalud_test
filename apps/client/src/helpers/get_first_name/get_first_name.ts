export const getFirstName = (fullName: string | undefined | null) => {
  if (!fullName) return "";

  const words = fullName.split(" ");
  return words[0];
};

export const getFirstNameAndFirstLastName = (
  fullName: string | undefined
): string => {
  if (!fullName) return "";

  const words = fullName.split(" ");

  if (words.length < 4) return words[0];

  return `${words[0]} ${words[2]}`;
};
