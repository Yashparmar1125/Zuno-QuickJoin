import api from '../lib/api';

export async function registerUser(payload) {
  const { data } = await api.post('/users/register', payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await api.post('/users/login', payload);
  return data;
}

export async function getMe(token) {
  const { data } = await api.get('/users/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function refreshToken() {
  const { data } = await api.post('/users/refresh');
  return data;
}

export async function logoutUser() {
  const { data } = await api.post('/users/logout');
  return data;
}

export async function changePassword(token, payload) {
  const { data } = await api.post('/users/change-password', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function forgotPassword(payload) {
  const { data } = await api.post('/users/forgot-password', payload);
  return data;
}

export async function resetPassword(token, payload) {
  const { data } = await api.post(`/users/reset-password/${token}`, payload);
  return data;
}


