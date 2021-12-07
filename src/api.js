import axios from "axios";

const HOST = process.env.REACT_APP_LIT_OPEN_FRIEND_API_HOST;

export const createFriendRequest = async (body) => {
  const resp = await axios.put(`${HOST}/friendRequests`, body);
  return resp.data;
};

export const getFriendRequests = async (body) => {
  const resp = await axios.post(`${HOST}/friendRequests`, body);
  return resp.data;
};

export const getFriends = async (body) => {
  const resp = await axios.post(`${HOST}/friends`);
};

export const createFriend = async (body) => {
  const resp = await axios.put(`${HOST}/friends`, body);
  return resp.data;
};

export default {
  createFriend,
  createFriendRequest,
  getFriendRequests,
  getFriends,
};
