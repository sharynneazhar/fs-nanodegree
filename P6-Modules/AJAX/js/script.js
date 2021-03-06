function loadData() {
  var GOOGLE_STREET_API = 'http://maps.googleapis.com/maps/api/streetview?size=600x300&location=';
  var NYT_API = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
  var WIKI_API = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=";

  var $body = $('body');
  var $wikiElem = $('#wikipedia-links');
  var $nytHeaderElem = $('#nytimes-header');
  var $nytElem = $('#nytimes-articles');
  var $greeting = $('#greeting');

  // form variables
  var $street = $('#street');
  var $city = $('#city');
  var $submitBtn = $('#submit-btn');

  // clear out old data before new request
  $wikiElem.text("");
  $nytElem.text("");

  if ($street.val() && $city.val()) {
    // load streetview
    var streetView = '<img class="bgimg" src="%data%" />';
    var address = $street.val() + ", " + $city.val();

    $body.append(
      streetView.replace('%data%', GOOGLE_STREET_API + address)
    );

    $greeting.text(address.toUpperCase());

    // load NYT articles
    NYT_API += '?' + $.param({
      'api-key': 'XXXXXXXXXXXXXXXXXXXXX',
      'q': address
    });

    $.getJSON(NYT_API, function(data) {
      if (data.response.meta.hits > 0) {
        $.each(data.response.docs, function(key, article) {
          $nytElem.prepend(
            '<li class="article">'
            + '<a href="' + article.web_url + '">' + article.headline.main + '</a>'
            + '<p>' + article.snippet + '</p>'
            + '</li>'
          );
        });
      } else {
        $nytElem.html('<li>No articles found</li>');
      }
    }).error(function() {
      $nytElem.html('<li>An error occurred. Please try again later.</li>');
    });

  } else {
    $('form').append(
      '<p class="error">Please fill in both fields.</p>'
    );

    setTimeout(function() {
      $('.error').slideUp("slow");
    }, 2000);
  }

  // load Wikipedia articles
  WIKI_API += $city.val() + '&limit=10&callback=wikiCallback';

  var wikiRequestTimeout = setTimeout(function() {
    $wikiElem.text("Failed to get Wikipedia resources");
  }, 5000);

  $.ajax({
    url: WIKI_API,
    dataType: 'jsonp'
  }).done(function(response) {
    var articleList = response[1];
    for (var article in articleList) {
      articleStr = articleList[article];
      var url = 'http://en.wikipedia.org/wiki/' + articleStr;
      $wikiElem.append(
        '<li><a href="' + url + '">' + articleStr + '</a></li>'
      );
    }
  });

  return false;
};

$('document').ready(function() {
  $('#form-container').submit(loadData);

});
