import { DateTimeFormat } from "types";

export const truncate = (str: string) => {
  if (!str) {
    return "";
  }
  return `${str.substring(0, 4)}...${str.substring(
    str.length - 4,
    str.length
  )}`;
};

// export const dateFormat = (date?: string) => {
//   const format: DateTimeFormat = {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   };

//   if (date) {
//     return new Date(date).toLocaleDateString("en-US", format);
//   }

//   return new Date().toLocaleDateString("en-US", format);
// };

export const dateFormat = (date?: string) => {
  if (!date) return "";

  // Example: "11/5/2025 1:48:51 PM"
  const [datePart] = date.split(" "); // "11/5/2025"
  const [month, day, year] = datePart.split("/");

  return `${day}/${month}/${year}`; // 5/11/2025
};


