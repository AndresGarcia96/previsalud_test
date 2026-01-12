export const maskEmail = (email: string | undefined): string | undefined => {
  if (email) {
    const [localPart, domain] = email.split("@");

    const visiblePercentage = 0.1;

    const startLength = Math.ceil(localPart.length * visiblePercentage);
    const endLength = Math.ceil(localPart.length * visiblePercentage);

    const startVisiblePart = localPart.substring(0, startLength);
    const endVisiblePart = localPart.substring(localPart.length - endLength);

    const maskedPart = "*".repeat(localPart.length - startLength - endLength);

    return `${startVisiblePart}${maskedPart}${endVisiblePart}@${domain}`;
  }
  return undefined;
};
