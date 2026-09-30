jest.mock('vue', () => ({
  createApp: jest.fn(() => ({ mount: jest.fn() }))
}));
jest.mock('../public/components/UserForm.vue', () => ({ __esModule: true, default: {} }));
jest.mock('../public/components/UserList.vue', () => ({ __esModule: true, default: {} }));

const { createApp } = require('vue');
require('../public/app.js');
const appOptions = createApp.mock.calls[0][0];

const payload = { name: 'Alice', email: 'alice@example.com', age: 31, country: 'Canada' };

describe('app handleSubmit', () => {
  let consoleError;

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleError.mockRestore());

  test.each([
    [null, '/api/users', 'POST'],
    [7, '/api/users/7', 'PUT']
  ])('refreshes and clears edit state after a successful save', async (id, url, method) => {
    const vm = { editingUser: { id: 7 }, fetchUsers: jest.fn() };
    global.fetch.mockResolvedValue({ ok: true });

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id });

    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({ method }));
    expect(vm.editingUser).toBeNull();
    expect(vm.fetchUsers).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  test.each([
    [null, '/api/users', 'POST'],
    [7, '/api/users/7', 'PUT']
  ])('preserves edit state and skips refresh after a non-OK response', async (id, url, method) => {
    const editingUser = { id: 7 };
    const vm = { editingUser, fetchUsers: jest.fn() };
    global.fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id });

    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({ method }));
    expect(consoleError).toHaveBeenCalledWith('Failed to save user:', 500, 'Internal Server Error');
    expect(vm.editingUser).toBe(editingUser);
    expect(vm.fetchUsers).not.toHaveBeenCalled();
  });

  test('reports network failures and preserves edit state without refreshing', async () => {
    const error = new Error('offline');
    const editingUser = { id: 7 };
    const vm = { editingUser, fetchUsers: jest.fn() };
    global.fetch.mockRejectedValue(error);

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id: 7 });

    expect(consoleError).toHaveBeenCalledWith('Failed to save user:', error);
    expect(vm.editingUser).toBe(editingUser);
    expect(vm.fetchUsers).not.toHaveBeenCalled();
  });
});
