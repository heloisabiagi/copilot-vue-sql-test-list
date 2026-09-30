import { createApp } from 'vue';
import UserForm from './components/UserForm.vue';
import UserList from './components/UserList.vue';

createApp({
  components: { UserForm, UserList },
  data() {
    return { users: [], editingUser: null };
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
      const { id, name, email, age, country } = payload;
      const rawAge = age === undefined || age === null ? '' : String(age).trim();
      const parsedAge = Number(rawAge);
      if (!name || !email || !country || rawAge === '' || !Number.isFinite(parsedAge)) return;
      if (id) {
        await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, age: parsedAge, country })
        });
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, age: parsedAge, country })
        });
      }
      this.editingUser = null;
      this.fetchUsers();
    },
    editUser(user) {
      this.editingUser = user;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    cancelEdit() {
      this.editingUser = null;
    },
    async removeUser(id) {
      if (!confirm('Delete this user?')) return;
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (this.editingUser && this.editingUser.id === id) this.cancelEdit();
      this.fetchUsers();
    }
  }
}).mount('#app');
