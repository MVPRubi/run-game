import uuid from "short-uuid";

export const generateId = () => {
  const shortUUID = uuid("0123456789");

  return shortUUID.generate().slice(0, 6);
};
