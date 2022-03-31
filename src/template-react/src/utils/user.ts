const TOKEN = 'token';

export const getToken = () => window.localStorage.getItem(TOKEN) || '';
export const setToken = (token: string) => window.localStorage.setItem(TOKEN, token);
