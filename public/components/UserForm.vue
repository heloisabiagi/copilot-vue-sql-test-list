<template>
  <form @submit.prevent="onSubmit" class="form">
    <div class="form-field">
      <label for="name">Name</label>
      <input id="name" v-model="name" placeholder="Name" required />
    </div>
    <div class="form-field">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" pattern="[^\s@]+@[^\s@.]+(\.[^\s@.]+)+" title="Enter an email address in the format name@example.com" placeholder="Email" required />
    </div>
    <div class="form-field">
      <label for="age">Age</label>
      <input id="age" v-model="age" type="number" min="0" placeholder="Age" required />
    </div>
    <div class="form-field">
      <label for="country">Country</label>
      <select id="country" v-model="country" required>
        <option value="" disabled>Select a country</option>
        <option v-for="countryOption in countryOptions" :key="countryOption.code" :value="countryOption.name">
          {{ countryOption.name }}
        </option>
      </select>
    </div>
    <div class="form-actions">
      <button type="submit" :disabled="saving">Save</button>
      <button type="button" :disabled="saving" @click="onCancel">Cancel</button>
    </div>
  </form>
</template>

<script>
import countries from 'i18n-iso-countries';
import englishLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(englishLocale);

const countryOptions = Object.entries(countries.getNames('en'))
  .map(([code, name]) => ({ code, name }))
  .sort((first, second) => first.name.localeCompare(second.name, 'en'));

export default {
  props: {
    userToEdit: { type: Object, default: null },
    saving: { type: Boolean, default: false }
  },
  data() {
    return { name: '', email: '', age: '', country: '', countryOptions, editingId: null };
  },
  watch: {
    userToEdit: {
      immediate: true,
      handler(u) {
        if (u) {
          this.editingId = u.id;
          this.name = u.name;
          this.email = u.email;
          this.age = u.age ?? '';
          this.country = u.country ?? '';
        } else {
          this.editingId = null;
          this.name = '';
          this.email = '';
          this.age = '';
          this.country = '';
        }
      }
    }
  },
  methods: {
    onSubmit() {
      const rawAge = this.age === undefined || this.age === null ? '' : String(this.age).trim();
      const parsedAge = Number(rawAge);
      this.$emit('submit', {
        id: this.editingId,
        name: this.name.trim(),
        email: this.email.trim(),
        age: rawAge !== '' && Number.isFinite(parsedAge) ? parsedAge : null,
        country: this.country.trim()
      });
    },
    onCancel() {
      this.$emit('cancel');
    }
  }
};
</script>
