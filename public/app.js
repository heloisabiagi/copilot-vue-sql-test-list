import { createApp } from 'vue';
import UserForm from './components/UserForm.vue';
import UserList from './components/UserList.vue';

createApp({
  components: { UserForm, UserList },
  data() {
    return { users: [], editingUser: null, isUserModalOpen: false, isSaving: false };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      const res = await fetch('/api/users');
      this.users = await res.json();
    },
    async handleSubmit(payload) {
      if (this.isSaving) return;
      const { id, name, email, age, country } = payload;
      const rawAge = age === undefined || age === null ? '' : String(age).trim();
      const parsedAge = Number(rawAge);
      if (!name || !email || !country || rawAge === '' || !Number.isFinite(parsedAge)) return;
      let response;
      this.isSaving = true;
      try {
        if (id) {
          response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, age: parsedAge, country })
          });
        } else {
          response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, age: parsedAge, country })
          });
        }
      } catch (error) {
        console.error('Failed to save user:', error);
        return;
      } finally {
        this.isSaving = false;
      }

      if (!response.ok) {
        console.error('Failed to save user:', response.status, response.statusText);
        return;
      }

      this.editingUser = null;
      this.isUserModalOpen = false;
      await this.fetchUsers();
    },
    startAddUser() {
      this.editingUser = null;
      this.isUserModalOpen = true;
    },
    editUser(user) {
      this.editingUser = user;
      this.isUserModalOpen = true;
    },
    cancelEdit() {
      this.editingUser = null;
      this.isUserModalOpen = false;
    },
    async removeUser(id) {
      if (!confirm('Delete this user?')) return;
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (this.editingUser && this.editingUser.id === id) this.cancelEdit();
      this.fetchUsers();
    }
  }
}).mount('#app');
