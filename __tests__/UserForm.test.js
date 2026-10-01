const { mount } = require('@vue/test-utils');
const UserForm = require('../public/components/UserForm.vue').default;

describe('UserForm SFC (mounted)', () => {
  test('renders a label for each input field', () => {
    const wrapper = mount(UserForm);
    expect(wrapper.find('label[for="name"]').exists()).toBe(true);
    expect(wrapper.find('label[for="email"]').exists()).toBe(true);
    expect(wrapper.find('label[for="age"]').exists()).toBe(true);
    expect(wrapper.find('label[for="country"]').exists()).toBe(true);
    expect(wrapper.find('label[for="name"]').text()).toBe('Name');
    expect(wrapper.find('label[for="email"]').text()).toBe('Email');
    expect(wrapper.find('label[for="age"]').text()).toBe('Age');
    expect(wrapper.find('label[for="country"]').text()).toBe('Country');
  });

  test('offers all countries in a required selector', () => {
    const wrapper = mount(UserForm);
    const countrySelect = wrapper.find('select#country');
    const options = countrySelect.findAll('option');

    expect(countrySelect.element.required).toBe(true);
    expect(options).toHaveLength(251);
    expect(countrySelect.find('option[value="Afghanistan"]').exists()).toBe(true);
    expect(countrySelect.find('option[value="Zimbabwe"]').exists()).toBe(true);
  });

  test('accepts email addresses with a dotted domain', async () => {
    const wrapper = mount(UserForm);
    const emailInput = wrapper.find('input[placeholder="Email"]');

    await emailInput.setValue('person@example.com');

    expect(emailInput.element.type).toBe('email');
    expect(emailInput.element.checkValidity()).toBe(true);
  });

  test.each(['person@example', 'person@.com', 'person@example.'])(
    'rejects invalid email address %s',
    async (email) => {
      const wrapper = mount(UserForm);
      const emailInput = wrapper.find('input[placeholder="Email"]');

      await emailInput.setValue(email);

      expect(emailInput.element.checkValidity()).toBe(false);
    }
  );

  test('submitting form emits trimmed payload', async () => {
    const wrapper = mount(UserForm);
    const nameInput = wrapper.find('input[placeholder="Name"]');
    const emailInput = wrapper.find('input[placeholder="Email"]');
    const ageInput = wrapper.find('input[placeholder="Age"]');
    const countryInput = wrapper.find('select#country');
    await nameInput.setValue(' Alice ');
    await emailInput.setValue(' a@b.com ');
    await ageInput.setValue('31');
    await countryInput.setValue('Canada');
    await wrapper.find('form').trigger('submit.prevent');
    const emitted = wrapper.emitted('submit');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({ id: null, name: 'Alice', email: 'a@b.com', age: 31, country: 'Canada' });
  });

  test('cancel button emits cancel when editing', async () => {
    const wrapper = mount(UserForm, { props: { userToEdit: { id: 2, name: 'Bob', email: 'b@b.com', age: 42 } } });
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  test('cancel button is available when adding a user', async () => {
    const wrapper = mount(UserForm);
    await wrapper.find('button[type="button"]').trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  test('disables cancel while saving', () => {
    const wrapper = mount(UserForm, { props: { saving: true } });
    expect(wrapper.find('button[type="button"]').element.disabled).toBe(true);
  });
});
