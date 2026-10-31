import client from './client';

export const createCrudApi = (path) => ({
  path,
  list: () => client.get(path),
  create: (payload) => client.post(path, payload),
  update: (id, payload) => client.put(`${path}/${id}`, payload),
  remove: (id) => client.delete(`${path}/${id}`),
});

export default createCrudApi;
