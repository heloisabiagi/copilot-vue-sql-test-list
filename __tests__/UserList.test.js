const { mount } = require('@vue/test-utils');
const UserList = require('../public/components/UserList.vue').default;

describe('UserList SFC (mounted)', () => {
  test('renders empty state when no users', () => {
    const wrapper = mount(UserList, { props: { users: [] } });
    expect(wrapper.text()).toContain('No users');
  });

  test('renders age and emits edit/delete events when buttons clicked', async () => {
    const users = [{ id: 1, name: 'A', email: 'a@a.com', age: 27, country: 'Canada' }];
    const wrapper = mount(UserList, { props: { users } });
    expect(wrapper.text()).toContain('Age: 27');
    expect(wrapper.text()).toContain('Country: Canada');
    await wrapper.find('button.edit').trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
    await wrapper.find('button.delete').trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
  });
});
