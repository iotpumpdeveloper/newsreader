<template>
  <div id="main-content">
    <news-portal></news-portal>
  </div>
</template>

<script>
  document.title = "Welcome to the news portal";

export default {
  components : { //register component locally
    'news-portal' : require('./components/NewsPortal.vue') //one line require local components!!!
  }
}

  </script>
