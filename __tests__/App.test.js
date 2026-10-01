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
    const vm = { editingUser: { id: 7 }, isUserModalOpen: true, isSaving: false, userModalSession: 1, fetchUsers: jest.fn() };
    global.fetch.mockResolvedValue({ ok: true });

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id });

    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({ method }));
    expect(vm.editingUser).toBeNull();
    expect(vm.isUserModalOpen).toBe(false);
    expect(vm.fetchUsers).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  test.each([
    [null, '/api/users', 'POST'],
    [7, '/api/users/7', 'PUT']
  ])('preserves edit state and skips refresh after a non-OK response', async (id, url, method) => {
    const editingUser = { id: 7 };
    const vm = { editingUser, isUserModalOpen: true, isSaving: false, userModalSession: 1, fetchUsers: jest.fn() };
    global.fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id });

    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({ method }));
    expect(consoleError).toHaveBeenCalledWith('Failed to save user:', 500, 'Internal Server Error');
    expect(vm.editingUser).toBe(editingUser);
    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.fetchUsers).not.toHaveBeenCalled();
  });

  test('reports network failures and preserves edit state without refreshing', async () => {
    const error = new Error('offline');
    const editingUser = { id: 7 };
    const vm = { editingUser, isUserModalOpen: true, isSaving: false, userModalSession: 1, fetchUsers: jest.fn() };
    global.fetch.mockRejectedValue(error);

    await appOptions.methods.handleSubmit.call(vm, { ...payload, id: 7 });

    expect(consoleError).toHaveBeenCalledWith('Failed to save user:', error);
    expect(vm.editingUser).toBe(editingUser);
    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.fetchUsers).not.toHaveBeenCalled();
  });

  test('opens the add and edit dialogs from their respective actions', () => {
    const user = { id: 7, name: 'Alice' };
    const vm = { editingUser: null, isUserModalOpen: false, userModalSession: 0 };

    appOptions.methods.startAddUser.call(vm);
    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.editingUser).toBeNull();
    expect(vm.userModalSession).toBe(1);

    vm.isUserModalOpen = false;
    appOptions.methods.editUser.call(vm, user);
    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.editingUser).toBe(user);
    expect(vm.userModalSession).toBe(2);
  });

  test('keeps the dialog open until the save request completes', async () => {
    let resolveSave;
    global.fetch.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    const vm = {
      editingUser: null,
      isUserModalOpen: true,
      isSaving: false,
      userModalSession: 1,
      fetchUsers: jest.fn().mockResolvedValue()
    };

    const savePromise = appOptions.methods.handleSubmit.call(vm, payload);

    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.isSaving).toBe(true);

    resolveSave({ ok: true });
    await savePromise;

    expect(vm.isUserModalOpen).toBe(false);
    expect(vm.isSaving).toBe(false);
  });

  test('a completed save does not close or clear a newer modal session', async () => {
    let resolveSave;
    global.fetch.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    const newerUser = { id: 8, name: 'Bob' };
    const vm = {
      editingUser: null,
      isUserModalOpen: true,
      isSaving: false,
      userModalSession: 1,
      fetchUsers: jest.fn().mockResolvedValue()
    };

    const savePromise = appOptions.methods.handleSubmit.call(vm, payload);
    vm.userModalSession = 2;
    vm.editingUser = newerUser;

    resolveSave({ ok: true });
    await savePromise;

    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.editingUser).toBe(newerUser);
    expect(vm.fetchUsers).toHaveBeenCalledTimes(1);
  });

  test('cancel closes the dialog and clears the selected user', () => {
    const vm = { editingUser: null, isUserModalOpen: true, isSaving: false, userModalSession: 1 };

    appOptions.methods.cancelEdit.call(vm);

    expect(vm.isUserModalOpen).toBe(false);
    expect(vm.editingUser).toBeNull();
    expect(vm.userModalSession).toBe(2);
  });

  test('cancel does not close the modal while a save is in flight', () => {
    const editingUser = { id: 7 };
    const vm = { editingUser, isUserModalOpen: true, isSaving: true, userModalSession: 1 };

    appOptions.methods.cancelEdit.call(vm);

    expect(vm.isUserModalOpen).toBe(true);
    expect(vm.editingUser).toBe(editingUser);
    expect(vm.userModalSession).toBe(1);
  });
});
