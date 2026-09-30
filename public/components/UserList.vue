<template>
  <div>
    <div v-if="users.length === 0" class="empty">No users</div>
    <ul v-else class="list">
      <li v-for="user in users" :key="user.id">
        <div>
          <strong>{{ user.name }}</strong> — {{ user.email }} — Age: {{ user.age ?? 'N/A' }} — Country: {{ user.country }}
        </div>
        <div>
          <button class="edit" @click="$emit('edit', user)">Edit</button>
          <button class="delete" @click="$emit('delete', user.id)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: { users: { type: Array, default: () => [] } }
};
</script>
