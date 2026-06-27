export function cutText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const shortText = text.slice(0, maxLength);
  const lastSpaceIndex = shortText.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    return `${shortText}...`;
  }

  return `${shortText.slice(0, lastSpaceIndex)}...`;
}
