/**
 * @class clickPic template class
 * @desription This is an updated version of the clickPic template.  The previous one is deprecated/only used for Spanish templates.
 * @param app
 * @returns {clickPic}
 */
function ClickPic(args) {
  var _config = {};
  setConfig(args);

  var app = getConfig().link,
    console = new Console();

  init();

  function getConfig() {
    return _config;
  }

  function getData() {
    return app.template.getData();
  }

  function init() {
    // Detect if this is being loaded via lightbox.  If so then ignore the standard initialization and use toolkitInit method.
    if ($('#lightbox_toolkit_lb').length > 0) {
      return;
    }

    app.hooks.clearHooks(); // Required to prevent previously loaded tests from firing
    insertLinks();
    Nifty('div#clickPic_container', 'big');
  }

  /**
   * @method insertLinks
   * @description This method builds the links and does the bindings for the hotspots that overlay the main graphic.
   * @param target
   */
  function insertLinks(target) {
    target = target || '#data_clickPic_content';

    console.info('@clickPic.insertLinks()');
    var clickElement = document.createElement('div'),
      coords = getData().lightboxes,
      coordsLength = getData().lightboxes.length;

    for (var i = 0; i < coordsLength; i++) {
      (function() // Closure required to reach the proper 'i'
        {
          var x = (function() {
            return i;
          })();

          clickElement = document.createElement('div');
          clickElement.className = 'sprite clickPic';

          // Check if custom hotspot graphic exists
          if (coords[x].hotSpot !== undefined && $.trim(coords[x].hotSpot).length > 0) {
            $(clickElement).css('background-image', 'url(/s3scorm/ale/content/assets/' + coords[x].hotSpot + ')');
          }

          $(clickElement).appendTo(target)
            .bind('click', function() {
              var that = this;

              $('#lightbox_things_lb').remove();

              if (coords[x].type === 'invis') {
                var id = $(this).attr('rel'),
                  that = this;

                //load lightbox
                app.lightbox.render({
                  'data': {
                    'type': 'things',
                    'content': {
                      'title': coords[x].title,
                      'html': '<div class="pointer"></div>' + coords[x].content
                    }
                  },
                  'callback': function() {
                    // This callback is necessary because of a strange bug in ie7
                    // When the html css is set to height: 100%, hiding this element causes the browser to hang
                    $('#lightbox_things_lb a').unbind()
                      .bind('click', function() {
                        $('#lightbox_things_lb').remove();
                        return false;
                      });

                    $('#lightbox_things_lb').addClass('soc');

                    $('#lightbox_toolkit_lb').css('display', 'inline');

                    if ($('#lightbox_toolkit_lb').length > 0) {
                      $('#lightbox_things_lb').css('left', (parseInt($('#lightbox_things_lb').css('left')) + 269));
                      $('#lightbox_things_lb').css('top', (parseInt($('#lightbox_things_lb').css('top')) + 52));
                    }
                  },
                  'global': app,
                  'id': 'things_lb',
                  'independent': false,
                  'modal': false,
                  'position': {
                    'type': 'relative',
                    'x': $('#lightbox_toolkit_lb').length > 0 ? ($(that).offset().left + 372) : ($(that).offset().left + 320),
                    'y': $('#lightbox_toolkit_lb').length > 0 ? (($(that).offset().top + $(that).height()) - 25) : (($(that).offset().top + $(that).height()) + 25)
                  },
                  'size': 'normal'
                });
                return false;
              }

              app.lightbox.render({
                'global': app,
                'id': x,
                'data': {
                  'type': coords[x].type || "clickPic",
                  'content': {
                    'title': coords[x].title,
                    'header': coords[x].header,
                    'html': coords[x].html || '',
                    'audio': coords[x].audio,
                    'definition': coords[x].definition,
                    'imageCaptionURL': coords[x].imageCaptionURL,
                    'imageCaption': coords[x].imageCaption
                  }
                },
                'buildNewCallback': function() {
                  if (coords[x].audio !== undefined) {
                    var string = '{"audio_' + x + '": {"type" : "audio","content" : "' + coords[x].audio.content + '"}}',

                      json = eval("(" + string + ')');
                  }

                  app.template.bindData({
                    source: json
                  });
                },
                'callback': function() {
                  if ($('#lightbox_toolkit_lb').hasClass('multibox') === true) {
                    if ($('#lightbox_toolkit_lb').hasClass('soc') === true) {
                      $('div.lightbox.normal.centered').css('height', '485px')
                        .addClass('audio');
                    }

                    if ($('#lightbox_toolkit_lb').hasClass('autoHeightLBs') === true) {
                      $('div.lightbox.normal.centered').css('height', 'auto');
                    }

                    $('#lightbox_toolkit_lb').addClass('under_modal');

                    $('div.lightbox.normal.centered').centerWithNavigation();

                    // Run a second time in case theres an image and auto height
                    setTimeout(function() {
                      $('div.lightbox.normal.centered').centerWithNavigation();
                    }, 1500);

                    $('#modal').unbind()
                      .one('click', function() {
                        $('#lightbox_toolkit_lb').removeClass('under_modal');
                        // Removed flow_player reference
                        // try {
                        //   flowplayer('*').each(function() {
                        //     if (this.isLoaded() === true) {
                        //       this.stop();
                        //       this.close();
                        //       this.unload();
                        //     }
                        //   });
                        // } catch (e) {
                        //   //                                                                                                           alert(e)
                        // }

                        $('div.lightbox.normal.centered').remove();

                        $('#modal').one('click', function() {
                          $('#modal').hide();
                          // Removed flow_player reference
                          // try {
                          //   flowplayer('*').each(function() {
                          //     if (this.isLoaded() === true) {
                          //       this.stop();
                          //       this.close();
                          //       this.unload();
                          //     }
                          //   });
                          // } catch (e) {
                          //   //                                                                                                                                      alert(e)
                          // }

                          $('#lightbox_toolkit_lb').remove();
                        });
                      });
                  }

                  setTimeout(function() {
                    $('div.lightbox.normal.centered').centerWithNavigation()
                      .addClass(coords[x].skin || '');
                  }, 200);

                  setTimeout(function() {
                    app.template.videoplayerHelper().play('#data_audio_' + x + ' .video-js');
                    // app.template.flowplayerHelper().play('div#data_audio_' + x + ' a.flowplayer');
                  }, 50);

                  $('body').one('lightbox.closed', function() {
                    if ($('#lightbox_toolkit_lb').hasClass('multibox') === true) {
                      $('#lightbox_toolkit_lb').removeClass('under_modal');
                    }

                    // Removed flow_player reference
                    // try {
                    //   flowplayer('*').each(function() {
                    //     if (this.isLoaded() === true) {
                    //       this.stop();
                    //       this.close();
                    //       this.unload();
                    //     }
                    //   });
                    // } catch (e) {
                    //   //                                                                                                                  alert(e)
                    // }

                    $('div.lightbox.normal.centered').remove();

                    return false;
                  });
                }
              });
            });

          $(clickElement).css({
            'top': coords[i].x + 'px',
            'left': coords[i].y + 'px'
          });
        })()
    }
  }

  function setConfig(args) {
    _config = $.extend({
      link: this
    }, args);
  }

  /**
   * @method toolkitInit
   * @description Does the standard insertLinks method but specifies the correct graphic id and also sets the correct data to use. 
   */
  App.prototype.toolkitInit = function() {
    getData = function() {
      return app.toolkit.getData();
    }

    insertLinks('#lightbox_data_clickPic_content');
    Nifty('div#clickPic_container', 'big');
  };
}

App.prototype.clickPic = new ClickPic({
  'link': ale
});