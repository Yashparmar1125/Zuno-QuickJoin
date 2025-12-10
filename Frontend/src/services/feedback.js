import api from '../lib/api';

export async function submitFeedback(payload, token) {
  const { data } = await api.post('/feedback/submit', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getMeetingFeedback(meetingId, token) {
  const { data } = await api.get(`/feedback/meeting/${meetingId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getFeedbackStats(meetingId, token) {
  const { data } = await api.get(`/feedback/stats/${meetingId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function getUserFeedback(token) {
  const { data } = await api.get('/feedback/user', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

