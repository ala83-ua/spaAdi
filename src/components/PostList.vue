<template>
  <div class="post-list">
    <Post v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script>
import Post from './Post.vue';

export default {
  name: 'PostList',
  components: {
    Post
  },
  props: {
    posts: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
