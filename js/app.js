$(document).ready(function () {
    const feedsCache = {};
    let currentFeedUrl = '';
    let currentPage = 1;
    const itemsPerPage = 5;
  
    const $feedContainer = $('.feed-container');
    const $pagination = $('.pagination');
    const $loadingAlert = $('.alert-loading');
    const $errorAlert = $('.alert-error');
  
    const feedItemTemplateSource = $('#feed-item-template').html();
    const feedItemTemplate = Handlebars.compile(feedItemTemplateSource);
  
    function showLoading() {
      $loadingAlert.removeClass('hidden');
      $errorAlert.addClass('hidden');
    }
  
    function showError() {
      $loadingAlert.addClass('hidden');
      $errorAlert.removeClass('hidden');
    }
  
    function hideAlerts() {
      $loadingAlert.addClass('hidden');
      $errorAlert.addClass('hidden');
    }
  
    function fetchFeed(url) {
      if (feedsCache[url]) {
        renderFeed(feedsCache[url]);
        return;
      }
  
      showLoading();
  
      $.ajax({
        url: 'https://api.rss2json.com/v1/api.json',
        method: 'GET',
        dataType: 'json',
        data: {
          rss_url: url
        }
      })
      .done(function (response) {
        if (response.status === 'ok') {
          feedsCache[url] = response.items;
          renderFeed(response.items);
        } else {
          showError();
        }
      })
      .fail(function () {
        showError();
      });
    }
  
    function renderFeed(items) {
      hideAlerts();
      currentPage = 1;
      const paginatedItems = _.chunk(items, itemsPerPage);
      renderPage(paginatedItems, currentPage);
      renderPagination(paginatedItems, currentPage);
    }
  
    function renderPage(paginatedItems, page) {
      $feedContainer.empty();
      const items = paginatedItems[page - 1] || [];
  
      items.forEach(item => {
        const context = {
          title: item.title,
          description: item.description,
          link: item.link,
          thumbnail: item.thumbnail,
          formattedDate: moment(item.pubDate).format('MMMM Do YYYY, h:mm:ss a')
        };
        const html = feedItemTemplate(context);
        $feedContainer.append(html);
      });
    }
  
    function renderPagination(paginatedItems, activePage) {
      $pagination.empty();
      const totalPages = paginatedItems.length;
  
      for (let i = 1; i <= totalPages; i++) {
        const $btn = $('<button>')
          .text(i)
          .addClass(i === activePage ? 'active' : '')
          .on('click', function () {
            currentPage = i;
            renderPage(paginatedItems, currentPage);
            renderPagination(paginatedItems, currentPage);
          });
  
        $pagination.append($('<li>').append($btn));
      }
    }
  
    $('.btn-group .btn').on('click', function () {
      const url = $(this).data('url');
      currentFeedUrl = url;
      fetchFeed(url);
    });
  });
  