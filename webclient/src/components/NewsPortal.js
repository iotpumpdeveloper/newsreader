export default {

  data () {
    return {
      'currentNewsSource' : '',
      'news' : {},
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
        'entertainment-weekly' : 'Entertainment Weekly',
        'engadget' : 'Engadget'
      },
      'currentArticleUrl' : '',
    }
  },

  methods: {
    switchToNewsSource (source) {
      if (this.currentNewsSource == source) { //clicking on the same source, no action 
        return;
      }
      this.currentNewsSource = source;
      this.currentArticleUrl = '';
      this.news = this.$newsStorage.get(source);
      this.$wsFactory.get('/livenews').sendMessage(source, (response) => {
        this.$newsStorage.set(source, JSON.parse(response.data));
        this.news = this.$newsStorage.get(source);
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
    this.switchToNewsSource(Object.keys(this.newsSources)[0]);
  }
}
