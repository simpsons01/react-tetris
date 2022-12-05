export const TOKEN_NAME = "haha_some_this_is_my_awesome_token";

export const getToken = (): string | null => {
  let token = null;
  const localStorageToken = localStorage.getItem(TOKEN_NAME);
  if (localStorageToken) {
    try {
      token = JSON.parse(localStorageToken);
      return token;
    } catch (error) {
      console.warn(error);
      return token;
    }
  }
  return token;
};

export const saveToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_NAME, JSON.stringify(token));
  } catch (error) {
    console.warn(error);
  }
};
