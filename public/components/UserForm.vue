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
    <div class="form-actions">
      <button type="submit">{{ editingId ? 'Save' : 'Add User' }}</button>
      <button type="button" v-if="editingId" @click="onCancel">Cancel</button>
    </div>
  </form>
</template>

<script>
export default {
  props: { userToEdit: { type: Object, default: null } },
  data() {
    return { name: '', email: '', age: '', editingId: null };
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
        } else {
          this.editingId = null;
          this.name = '';
          this.email = '';
          this.age = '';
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
        age: rawAge !== '' && Number.isFinite(parsedAge) ? parsedAge : null
      });
    },
    onCancel() {
      this.$emit('cancel');
    }
  }
};
</script>
