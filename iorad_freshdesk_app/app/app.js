(function () {
  "use strict";

  var CATEGORIES_API_URL = '/solution/categories.json';
  var ARTICLE_API_URL = '/solution/categories/{category_id}/folders/{folder_id}/articles.json';

  return {

    listCategories: function () {
      var that = this;
      jQuery.get(CATEGORIES_API_URL, function (data) {
        var template = '<option>No data available</option>';
        data.each(function (obj) {
          var category = obj.category;
          if (category.folders && category.folders.length > 0) {
            template = '<optgroup label="' + category.name + '">';
            category.folders.each(function (folder) {
              template += '<option value="' + folder.id + '" data-category-id="' + category.id + '" data-folder-id="' + folder.id + '">';
              template += folder.name + '</option>';
            });
            template += '</optgroup>';
          }
        });

        jQuery(that.$container).find('[name="category"]').html(template).addClass('select2');
      });
    },

    initialize: function () {
      if (page_type === "ticket") {
        CustomWidget.include_js("//iorad.com/server/assets/js/iorad.js");
        appPlaceholder.ticket.belowRequestorInfo(jQuery(this.$container));
        this.ioradLoaded();

        this.listCategories();
      }
    },

    initApp: function () {
      var domHelper = domHelper;
      var $container = this.$container;
      var $pageBody = jQuery($container).closest("body");
      var $solutionForm = jQuery($container).find(".iorad-solution");
      var openReplayArea = function () {
        if ($pageBody.find(".redactor_editor div").length == 0) {
          $pageBody.find('#FwdButton').first().click();
        }
      };
      var modal = jQuery($container).find('.iorad-widget-modal');

      var iorad = window.iorad || {};

      iorad.init({env: "live", pluginType: "iorad_freshdesk_app_ticketing"}, function () {
        // register events
        $solutionForm.on('submit', function (e) {
          e.preventDefault();

          $pageBody.addClass("iorad-loading");
          iorad.createTutorial();

          jQuery("#iorad-editor").off().load(function () {
            $pageBody.removeClass("iorad-loading").addClass("iorad-open");
          });
        });

        iorad.on("editor:close", function (tutorialParams) {

          var category = jQuery($container).find("[name='category'] option:selected");
          var categoryId = category.data('category-id');
          var folderId = category.data('folder-id');
          var isdraft = jQuery($container).find("[name='draft']").is(':checked');
          var addToTicket = jQuery($container).find("[name='ticket']").is(':checked');

          var iframeHTML = iorad.getEmbeddedPlayerUrl(tutorialParams.uid, tutorialParams.tutorialId, tutorialParams.tutorialTitle);
          if (addToTicket) {
            openReplayArea();
            $pageBody.find(".redactor_editor div").append("<p>" + iframeHTML + "</p>");
          }

          var ARTICLE_URL = "/solution/categories/{categoryId}/folders/{folderId}/articles/{id}";
          var URL = ARTICLE_API_URL.replace('{category_id}', categoryId).replace('{folder_id}', folderId);
          var article = {
            "solution_article": {
              "title": tutorialParams.tutorialTitle,
              "folder_id": folderId,
              "description": "<p>" + iframeHTML + "</p>",
              "status": isdraft ? 1 : 2,
              "art_type": 1 // permanent
            }
          };

          jQuery.post(URL, article, function (data) {
            $pageBody.removeClass("iorad-open iorad-loading");

            var articleUrl = ARTICLE_URL.replace('{categoryId}', categoryId)
              .replace('{folderId}', folderId)
              .replace('{id}', data.article.id);

            var message = "The solution <b>" + tutorialParams.tutorialTitle + "</b> has been published to <b>" + category.text() + "</b>";
            if (isdraft) {
              message = "The draft solution <b>" + tutorialParams.tutorialTitle + "</b> has been created to <b>" + category.text() + "</b>";
            }
            if (addToTicket) {
              message += " and attached to the ticket.";
            } else {
              message += ".";
            }

            modal.find(".modal-footer a").attr("href", articleUrl);
            modal.find(".modal-body").html(message);
            if ($pageBody.children('.iorad-widget-modal').length > 0) {
              $pageBody.children('.iorad-widget-modal').html(modal.html()).modal({ backdrop: true, show: true });
            } else {
              $pageBody.append(modal);
              $pageBody.children('.iorad-widget-modal').modal({ backdrop: true, show: true });
            }
          });
        });
      });
    },

    ioradLoaded: function () {
      var that = this;
      var interval = 10;
      var tryLoad = function () {
        if (window.iorad) {
          that.initApp();
        } else {
          window.setTimeout(tryLoad, interval);
        }
      };

      window.setTimeout(tryLoad, interval);
    }
  };
})();