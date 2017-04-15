export default {

  data () {
    return {
      'currentNewsSource' : '',
      'news' : {},
      'news_loading' : 0, //see if the news is loading
      'newsSources' : {
        'cnn' : 'CNN',
        'hacker-news' : 'Hacker News',
        'techcrunch' : 'Tech Crunch',
        'time' : 'Times',
        'fortune' : 'Fortune',
        'new-scientist' : 'New Scientist',
        'espn' : 'ESPN',
        'business-insider' : 'Business Insider',
        'financial-times' : 'Financial Times',
        'ign' : 'IGN',
      },
      'currentArticleUrl' : '',
    }
  },

  methods: {
    switchToNewsSource (source) {
      this.news_loading = 1;
      this.currentNewsSource = source;
      this.currentArticleUrl = '';
      this.$wsFactory.get('/livenews').sendMessage(source, (response) => {
        this.news = JSON.parse(response.data);
        this.news_loading = 0;
      }); 
    },
    classForKey (key) {
      if (this.currentNewsSource == key) {
        return 'active';
      } else {
        return 'inactive';
      }
    },
    viewArticle (url) {
      this.currentArticleUrl = url;
    }
  },

  mounted () {
    this.currentNewsSource = Object.keys(this.newsSources)[0];
    this.switchToNewsSource(this.currentNewsSource);
  }
}

