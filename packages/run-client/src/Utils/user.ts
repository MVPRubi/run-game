export const createUser = (userName: string) => {
  const userId = Math.floor(Math.random() * 100000).toString();

  const user = {
    userId,
    userName,
  };

  sessionStorage.setItem("user", JSON.stringify(user));

  return user;
};

export const tryGetUser = () => {
  const cacheUser = sessionStorage.getItem("user");
  if (!cacheUser) {
    return null;
  }
  return JSON.parse(cacheUser);
};

export const tryGetUserId = () => {
  return tryGetUser()?.userId;
};
