function Toolkit(args) {
  var _config = {},
    _data,
    _toolkitItems = 0,
    _thingsItems = 0;

  setConfig(args);

  var app = getConfig().link;

  // Initialized from template.js, should move toolkit-package checking to template.js
  this.init = init;
  this.getData = getData;
  this.scaffoldLightbox = scaffoldLightbox;

  function buildThings() {
    // Add button container 
    var thingsContainer = document.createElement('div'),
      thingsContainer = $(thingsContainer),
      thingsTab = document.createElement('div'),
      thingsTab = $(thingsTab);

    thingsContainer.attr('id', 'things_container');
    thingsTab.attr('id', 'things_tab');

    thingsContainer.appendTo('body');
    DD_roundies.addRule('#things_tab', '0 0 5px 5px', true);

    fillThings({
      things: app.template.getData().metadata[0].things
    });
  }

  function buildToolkit(args) {
    args = args || {};

    // Add button container
    var config = args.config || {
        header: 'toolkit',
        horizontal: false,
        closable: true
      },
      filter = app.template.getData().metadata[0].toolkit || 0,
      filterLength = filter.length || 0,
      iconsContainer = $(document.createElement('div')),
      iconsWrapper,
      toolkitContainer = document.createElement('div'),
      toolkitContainer = $(toolkitContainer),
      toolkitHeader = $(document.createElement('div')),
      toolkitTab = document.createElement('div'),
      toolkitTab = $(toolkitTab);

    toolkitContainer.attr('id', 'toolkit_container');

    // Determine if this toolkit will be vertical (default) or horizontal
    if (config.horizontal === true) {
      iconsWrapper = $(document.createElement('div'));


      toolkitContainer.addClass('horizontal');

      // Create and append toolkit titles (links to expand activities)
      $(document.createElement('div')).addClass('toolkit-group-titles')
        .appendTo(iconsWrapper);

      iconsContainer.addClass('toolkit-icons-container')
        .appendTo(iconsWrapper);

      iconsWrapper.addClass('icons-wrapper')
        .appendTo(toolkitContainer);
    }

    //Appends elements to toolkit
    //    fillToolKit({
    //                 tools : app.getPackageData().packageData[0].toolkit,
    //                 filter : filter
    //                });   

    if (config.closable === true) {
      // Add toolkit tab
      toolkitTab.attr('id', 'toolkit_tab');

      toolkitTab.addClass('toolkit_open');

      toolkitTab.appendTo(toolkitContainer);

      $('#toolkit_tab').live('click', function() {
        if ($(this).attr('class') === 'toolkit_open') {
          $('#toolkit_tab').removeClass('toolkit_open');
          $('#toolkit_tab').addClass('toolkit_closed');

          $.each($('.toolkit_item_container'), function() {
            $(this).remove();
          });
          $('.toolkit_header').remove();
          $('.toolkit_emptyTip').remove();
          return false;
        }

        if ($(this).attr('class') === 'toolkit_closed') {
          $('#toolkit_container').remove();
          delegateToolkit();
          return false;
        }
      });
    }

    if (config.header !== false) {
      toolkitHeader.addClass('toolkit_header')
        .html('<div class="toolkit-arrow"/>' + config.header);

      // Prepend the toolkit header
      if (config.horizontal === true) {
        iconsWrapper.prepend(toolkitHeader);
      } else {
        toolkitContainer.prepend(toolkitHeader);
      }
    }

    toolkitContainer.appendTo('body');
  }

  function clearData() {
    _data = undefined;
  }

  function delegateToolkit() {
    var currentPage = app.getPageName();

    // Check if the toolkit definition exists
    if (app.getPackageData().packageData[0].toolkit === undefined || app.getPackageData().packageData[0].toolkit.length === 0) {
      return;
    }

    switch (typeof app.getPackageData().packageData[0].toolkit.config) {
      case 'undefined':
        // Case for classic toolkit (used in history)
        buildToolkit();

        fillToolKit({
          filter: app.template.getData().metadata[0].toolkit,
          tools: app.getPackageData().packageData[0].toolkit
        });

        buildThings();

        $('a.toolkit_item.active').bind('click', function() {
          scaffoldLightbox({
            template: $(this).attr('rel')
          });
        });
        break;

      case 'object':
        if (app.getPackageData().packageData[0].toolkit.config.buttons === true) {
          buildButtonsToolkit();
        } else {
          buildToolkit({
            config: app.getPackageData().packageData[0].toolkit.config
          });

          $.each(app.getPackageData().packageData[0].toolkit.groups, function(index, value) {
            fillToolKit({
              config: app.getPackageData().packageData[0].toolkit.config,
              group: value
            });
          });

          // Filtering
          $.each(app.template.getData().metadata[0].toolkit, function(index, value) {
            $('div.toolkit_item_container:eq(' + value + ') a.toolkit_item').removeClass('active')
              .addClass('inactive');

            $('div.toolkit_item_container:eq(' + value + ') div.toolkit_item').removeClass('active')
              //.removeClass('read_active research_active hypothesize_active')
              .addClass('inactive');
          });

          $('div.notepad-icon').live('click', function() {
            ale.template.showNotepad();
            return false;
          });

          $('div.toolkit_header').bind('click', function() {
            $('div.toolkit-group').removeClass('open');
            if ($('div#toolkit_container').hasClass('expanded') === true) {
              // Remove active classes on any groups that are open
              $('div.toolkit-group-items:has(.active)').removeClass('active');

              // Remove active class on selected group
              $('div.toolkit-title.selected').removeClass('selected');
            } else {
              var current = $('div.toolkit-title.currentGroup').index('div.toolkit-title');

              // Activate current group since a section was not selected, clicked the header tab
              $('div.toolkit-group:eq(' + current + ')').addClass('open');

              $('div.toolkit-title:eq(' + current + ')').addClass('selected');
              $('div.toolkit-group-items:eq(' + current + ')').addClass('active');
            }

            $('div#toolkit_container').toggleClass('expanded');
            $('div.toolkit-arrow').toggleClass('open');
          });

          $('div.toolkit-group-titles a').bind('click', function() {
            $('div#toolkit_container').addClass('expanded');

            $('div.toolkit-group').removeClass('open');
            $('div.toolkit-title').removeClass('selected');
            $(this).parent('div.toolkit-title').addClass('selected');

            $('div.toolkit-group-items:not(:eq(' + $(this).index('div.toolkit-group-titles a') + '))').removeClass('active');

            $('div.toolkit-group-items:eq(' + $(this).index('div.toolkit-group-titles a') + ')').addClass('active');

            $('div.toolkit-group-items.active').parent('div.toolkit-group').addClass('open');

            $('div.toolkit-group-items.active div.toolkit_item_container:eq(' + ($('div.toolkit-group-items.active div.toolkit_item_container').length - 1) + ')').css('borderRight', 'none');
          });

          $('a.toolkit_item.active, div.toolkit_item.active').bind('click', function() {
            var template = $(this).attr('rel') || $(this).parent('div.toolkit_item_container').find('a.toolkit_item.active').attr('rel');

            // removed flow_player reference
            // try {
            //   flowplayer('*').each(function() {
            //     if (this.isLoaded() === true) {
            //       this.stop();
            //       this.close();
            //       this.unload();
            //     }
            //   });
            // } catch (e) {
            //   //                                                                            alert(e)
            // }
            app.template.videoplayerHelper().pauseOtherVideo();
            scaffoldLightbox({
              template: template,
              callback: function() {
                $('body').unbind()
                  .bind('template.loaded', function() {
                    var localData = {
                      thisPage: app.getTest().getQuestionBank(template)
                    };

                    app.localData = localData;
                    try {
                      //                                                                                                                                                app.thisTemplate.toolkitInit({
                      app.toolkitInit({
                        // TODO: testData and jsonData should be rolled together because testData is missing the jsonData when the specific template is loaded from toolkit after returning to the test
                        // I.e. Take selectAndJustify, save and exit, reload, open selectAndJustify from the toolkit, the json data (correctAnswers) is missing
                        testData: app.getTest().getQuestionBank(template),
                        jsonData: getData(),
                        template: template
                      });

                      $('#lightbox_toolkit_lb a.chooseOne').each(function(i, e) {
                        $(this).replaceWith($(this).html());
                      });
                    } catch (e) {
                      //console.info('NO INIT');
                    }
                    //                                                                                                                                              loadAndRender();
                    //                                                                                                                                              console.debug(app.localData)
                  });

                $('body').trigger('template.loaded');
              }
            });
          });

          //       $('div.toolkit-group-items').

          // Check to see which page is active, highlight it's icon in the toolkit as well as group section
          $('a.toolkit_item').each(function(index, element) {
            if ($(this).attr('rel') === currentPage) {
              $(this).addClass('currentPage')
                .parent('div.toolkit_item_container').addClass('currentPage');
            }
          });

          // Manage CSS for section titles
          // Set current group
          $('div.toolkit-title:eq(' + $('div.toolkit-group').has('a.toolkit_item.currentPage').index('div.toolkit-group') + ')').addClass('currentGroup');

          // Set first and last divs
          $('div.toolkit-title:eq(0)').addClass('first');
          $('div.toolkit-title:eq(' + ($('div.toolkit-title').length - 1) + ')').addClass('last');

          //       DD_roundies.addRule('div.toolkit-title', '5px', true);
          if ($.browser.msie === undefined && $.browser.version !== '7.0') {
            //DD_roundies.addRule('div.toolkit_header', '5px 5px 0 0', true);
            DD_roundies.addRule('div.toolkit-group', '5px', true);
          }

          // Add notepad icon
          $(document.createElement('div')).addClass('notepad-icon')
            .appendTo('div.toolkit-group-titles');

          //       $('div#navigation_container').hide();
          break;
        }
    }
  }

  function fillThings(args) {
    var args = args || {},
      things = args.things,
      thingsContainer = $('#things_container');

    if (args.things) {
      var thingsLength = args.things.length;

      var thingsItem = document.createElement('div'),
        thingsItem = $(thingsItem);

      thingsItem.addClass('things_item');

      thingsItem.html(['<a href="#" class="things_item" rel="',
        0,
        '">',
        things[0].title,
        '</a>'
      ].join(''));

      thingsContainer.prepend(thingsItem);
    }

    $('a.things_item').bind('click', function() {
      var id = $(this).attr('rel'),
        that = this;

      // Remove previous lightbox if it exists
      $('.lightbox:not(.toolkit_ignore)').remove();

      //load lightbox
      app.lightbox.render({
        'data': {
          'type': 'things',
          'content': {
            'title': 'things to think about',
            'html': things[0].content
          }
        },
        'callback': function() {
          // This callback is necessary because of a strange bug in ie7
          // When the html css is set to height: 100%, hiding this element causes the browser to hang
          $('#lightbox_things_lb a, .lightbox a').unbind()
            .bind('click', function() {
              $('#lightbox_things_lb').remove();
              return false;
            });
        },
        'global': app,
        'id': 'things_lb',
        'independent': true,
        'modal': false,
        'position': {
          'type': 'relative',
          'x': ($(that).offset().left + (($(that).width() / 2) - 100)),
          'y': ($(that).offset().top + $(that).height()) + 15
        },
        'size': 'normal'
      });
      return false;
    });
  }

  function fillToolKit(args) {
    var args = args || {},
      filter = args.filter || 0,
      filterLength,
      group = args.group || false,
      toolkit = $('#toolkit_container'),
      tools = args.tools || group.items;

    if (group.items !== undefined) {
      filterLength = (group.items.length - 1);
    } else {
      filterLength = filter.length;
    }


    if (group) {
      var groupDiv,
        groupHeaders = $('div.toolkit-group-titles');

      groupHeaders.append('<div class="toolkit-title"><a>' + group.title + '</a></div>');

      // Redefine toolkit because this group will be the new landing area for icons
      groupDiv = $(document.createElement('div')).addClass('toolkit-group');
      //                                                 .prepend($(document.createElement('img')).attr('src', app.baseURL + 'resources/assets/' + group.icon).addClass(group.title));

      toolkit = $(document.createElement('div')).addClass('toolkit-group-items')
        .appendTo(groupDiv);

      groupDiv.appendTo('div.toolkit-icons-container');
    }

    if (tools) {
      var toolsLength = tools.length;

      if (filter) {
        var y = 0;

        for (y; y < filterLength; y++) {
          if (tools[filter[y]] === undefined) {
            alert('ERROR: Check current template JSON for invalid toolkit filter. Attempting to filter out a toolkit item that does not exist.');
            return;
          }

          if (typeof tools[filter[y]].icon === 'string') {
            if (tools[filter[y]].icon.indexOf('*') !== -1) {
              var file = tools[filter[y]].icon.split('*'),
                name = file[0],
                extension = file[1];

              tools[filter[y]].iconState = [name,
                '_inactive',
                extension
              ].join('');

              tools[filter[y]].inactive = true;
            }
          } else {
            // Do filtering in delegateToolkit
          }

        }
      }

      // Decrement loop because we want to preserve our array order without having to re-append the tab
      for (var x = toolsLength; x > 0; x--) {
        var caption = '',
          classModifier = 'active',
          toolkitItem = document.createElement('div'),
          toolkitItem = $(toolkitItem);

        if (tools[x - 1].caption !== undefined) {
          caption = $(document.createElement('span'));

          caption = caption.html(tools[x - 1].caption)
            .html();
        }

        if (typeof tools[x - 1].icon === 'string') {
          if (tools[x - 1].icon.indexOf('*') !== -1) {
            var file = tools[x - 1].icon.split('*'),
              name = file[0],
              extension = file[1];

            if (tools[x - 1].iconState === undefined || tools[x - 1].iconState.length < 1) {
              tools[x - 1].iconState = [name,
                '_active',
                extension
              ].join('');

              tools[x - 1].inactive = false;
            }
          }

          //build icon
          if (tools[x - 1].inactive === true) {
            classModifier = 'inactive';
          }

          toolkitItem.addClass('toolkit_item_container');
          var htmlArr = ['<a href="#" class="toolkit_item ',
            classModifier,
            '" rel="',
            tools[x - 1].json,
            '">',
            caption,
            '<img src="/s3scorm/ale/content/assets/',
            tools[x - 1].iconState,
            '" alt="',
            tools[x - 1].title,
            '">',
            '</a>'
          ];
          toolkitItem.html(htmlArr.join(''));
        } else {
          //type is an object

          if (tools[x - 1].inactive === true) {
            classModifier = 'inactive';
          }

          tools[x - 1].iconState = tools[x - 1].iconState || tools[x - 1].icon.active;

          //build icon
          toolkitItem.addClass('toolkit_item_container');
          //          toolkitItem.html(['<a href="#" class="toolkit_item ',
          //                               classModifier,
          //                               '" rel="',
          //                               tools[x-1].json,
          //                               '">',
          //                               caption,
          //                               '</a>',
          //                               '<div class="toolkit_item ',
          //                               classModifier,
          //                               ' ',
          //                               tools[x-1].iconState,
          //                               '">'].join(''));

          // reverse the order of anchor and div for Toolkit 2.0  
          toolkitItem.html(['<div class="toolkit_item ',
            classModifier,
            ' ',
            tools[x - 1].iconState,
            '"/>',
            '<a href="#" class="toolkit_item ',
            classModifier,
            '" rel="',
            tools[x - 1].json,
            '">',
            caption,
            '</a>',
          ].join(''));
        }

        toolkit.prepend(toolkitItem);

        tools[x - 1].iconState = '';
      }
    }

    // If all the items are filtered then hide the toolkit
    if (app.getPackageData().packageData[0].toolkit.length === filterLength) {
      var emptyTip = document.createElement('div'),
        emptyTip = $(emptyTip);

      emptyTip.addClass('toolkit_emptyTip');

      emptyTip.html('This toolkit will become active as you make progress in your mission.');

      $('div#toolkit_container').append(emptyTip);

      // Set minimum room so our zero state text is correctly shown (enough height)
      if ($('.toolkit_item_container').length < 3) {
        var height = (3 - $('.toolkit_item_container').length) * 160;

        $('.toolkit_item_container:eq(' + ($('.toolkit_item_container').length - 1) + ')').css('height', height + 'px');
      }
    }
  }

  function buildButtonsToolkit() {
    var toolkitObj = app.getPackageData().packageData[0].toolkit;
    buildToolkitHml(toolkitObj.config);
    bindToolkit();
  }

  function buildToolkitHml(args) {
    $('toolkit_container').remove();

    var iconsContainer = $(document.createElement('div')),
      toolkitContainer = $(document.createElement('div')),
      pagesInfoContainer = $(document.createElement('div')),
      pagesNumber = $(document.createElement('div')),
      prevPages = $(document.createElement('div')),
      boxContainer = $(document.createElement('div')),
      singlePageContainer = $(document.createElement('a')),
      notepadContainer = $(document.createElement('div')),
      box = $(document.createElement('div')),
      singlePage = $(document.createElement('div')),
      notepad = $(document.createElement('div'));

    pagesNumber.addClass('page-number').text('Page ' + (app.getCurrentPage() + 1) + ' of ' + (app.getPageArray().length - 1)).appendTo(pagesInfoContainer);
    prevPages.addClass('link prev-pages').text('View Previous Pages').appendTo(pagesInfoContainer);
    pagesInfoContainer.addClass('page-info').appendTo(iconsContainer);

    notepadContainer.addClass('align-right notepad-icon').html('<div class="text-container">Notepad</div>');
    singlePageContainer.addClass('align-right single-page').attr('rel', app.getPackageData().packageData[0].toolkit.singlePage).html('<div class="text-container">' + args.page_header + '</div>');
    boxContainer.addClass('align-right toolkit_box').html('<div class="text-container">' + args.box_header + '</div>');
    //box.addClass('button').appendTo(boxContainer);
    //singlePage.addClass('button').appendTo(singlePageContainer);
    box.addClass('button').appendTo(boxContainer).html('<img src=/s3scorm/ale/content/assets/' + args.box_image + '>');
    singlePage.addClass('button').appendTo(singlePageContainer).html('<img src=/s3scorm/ale/content/assets/' + app.getPackageData().packageData[0].toolkit.singlePage_icon + '>');
    notepad.addClass('button').appendTo(notepadContainer);
    notepadContainer.appendTo(iconsContainer);
    singlePageContainer.appendTo(iconsContainer);
    boxContainer.appendTo(iconsContainer);

    iconsContainer.addClass('icons-container');

    iconsContainer.appendTo(toolkitContainer);
    toolkitContainer.attr('id', 'toolkit_container');
    toolkitContainer.addClass('buttons').appendTo('body');


  }

  function bindToolkit() {
    $('div.notepad-icon').unbind('click').bind('click', function() {
      ale.template.showNotepad();
      return false;
    });

    $('a.single-page').unbind('click').bind('click', function() {
      buildPageTemplate({
        'target': this
      });
    });

    $('.prev-pages').unbind('click').bind('click', function() {
      openLightbox('toolkit');
    });

    $('.align-right.toolkit_box').unbind('click').bind('click', function() {
      openLightbox('box');
    });
  }

  function openLightbox(type) {
    $('.lightbox').remove();

    // Hide the underlying flash if we are on a counterpoint pageType.
    // Solves an issue with webkit browsers where you cannot click on the markers within a google maps canvas. (when google maps is loaded on top of flash)
    $('body.counterpoint #data_timeline').hide();


    //load lightbox
    app.lightbox.render({
      'global': app,
      'id': 'toolkit_lb',
      'data': {
        'type': 'toolkit'
      },
      'callback': function() {
        switch (type) {
          case 'toolkit':
            buildToolkitIcons({
              'toolkitData': app.template.getData().metadata[0].toolkit,
              'pagesData': app.getPackageData().packageData[0].toolkit.pages
            });
            break;
          case 'box':
            buildBoxIcons({
              'boxData': app.template.getData().metadata[0].box,
              'pagesData': app.getPackageData().packageData[0].toolkit.box
            });
            break;
        }

      },
      'size': 'lightbox_window_width',
      'position': {
        'type': 'relative',
        'x': '2.5',
        'y': '5'
      }
    });
    $('#lightbox_toolkit_lb a.close, #modal').unbind('click').bind('click', onLightboxClose);
    $(document).unbind('keydown.toolkit')
      .bind('keydown.toolkit', function(e) {
        if (e.keyCode === 27) {
          onLightboxClose();
          return false;
        }
      });
  }

  function buildPageTemplate(args) {
    var template = $(args.target).attr('rel') || $(args.target).parent('div.toolkit_item_container').find('a.toolkit_item.active').attr('rel');

    var text = args.text || '';
    args.text = text;
    // delete flow_player reference
    // try {
    //   flowplayer('*').each(function() {
    //     if (this.isLoaded() === true) {
    //       this.stop();
    //       this.close();
    //       this.unload();
    //     }
    //   });
    // } catch (e) {
    //   //                                                                      alert(e)
    // }
    app.template.videoplayerHelper().pauseOtherVideo();
    scaffoldLightbox({
      template: template,
      callFrom: args,
      callback: function() {
        $('body').unbind()
          .bind('template.loaded', function() {
            var localData = {
              thisPage: app.getTest().getQuestionBank(template)
            };

            app.localData = localData;
            try {
              //                                                                                                                                          app.thisTemplate.toolkitInit({
              app.toolkitInit({
                // TODO: testData and jsonData should be rolled together because testData is missing the jsonData when the specific template is loaded from toolkit after returning to the test
                // I.e. Take selectAndJustify, save and exit, reload, open selectAndJustify from the toolkit, the json data (correctAnswers) is missing
                testData: app.getTest().getQuestionBank(template),
                jsonData: getData(),
                template: template
              });

              $('#lightbox_toolkit_lb a.chooseOne').each(function(i, e) {
                $(this).replaceWith($(this).html());
              });
            } catch (e) {
              //console.info('NO INIT');
            }
            //                                                                                                                                        loadAndRender();
            //                                                                                                                                        console.debug(app.localData)
          });

        $('body').trigger('template.loaded');
      }
    });
  }

  function buildToolkitIcons(args) {
    var toolkitData = args.toolkitData,
      pagesData = args.pagesData,
      iconContainer,
      toolkitImage,
      mainContainer = $(document.createElement('div')),
      pageNumber,
      pageName;
    mainContainer.addClass('main-container');

    $.each(pagesData, function(index, value) {
      iconContainer = $(document.createElement('a'));
      toolkitImage = $(document.createElement('div'));
      pageNumber = $(document.createElement('div'));
      pageName = $(document.createElement('div'));

      iconContainer.addClass('iconContainer');
      pageNumber.addClass('page-value').text(index + 1);
      toolkitImage.addClass('toolkit-image');
      pageName.addClass('page-name').html(value.caption);

      if ($.inArray(index, toolkitData) === -1) {
        iconContainer.addClass('active ' + value.icon.active);
        iconContainer.attr('rel', value.json);
      } else {
        iconContainer.addClass('inactive ' + value.icon.inactive);
      }

      toolkitImage.appendTo(iconContainer);
      pageNumber.appendTo(iconContainer);
      pageName.appendTo(iconContainer);
      iconContainer.appendTo(mainContainer);
      //    $('.lightbox.lightbox_window_width').centerWithNavigation();
      //    $('div#lightbox_toolkit_lb').css('visibility', 'visible');
      //    $('div#lightbox_toolkit_lb .lightbox_title_data').text('View Previous Pages');
      //    $('div#lightbox_toolkit_lb').addClass('toolkit_lightBox');
    });


    mainContainer.appendTo('div.lightbox_window_width .lightbox_content_container');
    $('.lightbox.lightbox_window_width').centerWithNavigation();
    $('div#lightbox_toolkit_lb').css('visibility', 'visible');
    $('div#lightbox_toolkit_lb .lightbox_title_data').text('View Previous Pages');
    $('div#lightbox_toolkit_lb').addClass('toolkit_lightBox');
    $('.iconContainer:eq(' + toolkitData[0] + ')').addClass('current');
    $('#lightbox_toolkit_lb.toolkit_lightBox .iconContainer.active').unbind('click').bind('click', function() {
      buildPageTemplate({
        'target': this,
        'text': '<div class="titleContainer"><span class="prevPage link titleContainer">View Previous Pages</span> > ' + $(this).find('.page-name').text() + '</div>'
      });
    });
  }

  function bindToolkitIcons() {
    $('#lightbox_toolkit_lb .prevPage.link').unbind('click').bind('click', function() {
      openLightbox('toolkit');
    });

    $('#lightbox_toolkit_lb .box_text.link').unbind('click').bind('click', function() {
      openLightbox('box');
    });
  }

  function buildBoxIcons(args) {
    var boxData = args.boxData,
      pagesData = args.pagesData,
      iconContainer,
      boxImage,
      imgConatainer = $(document.createElement('div')),
      pointerContainer = $(document.createElement('div')),
      mainContainer = $(document.createElement('div')),
      pageTitle;
    mainContainer.addClass('main-container');
    imgConatainer.addClass('glovebox_img');
    pointerContainer.addClass('pointer_img');

    if (boxData && pagesData) {
      $.each(boxData, function(index, value) {
        iconContainer = $(document.createElement('a'));
        boxImage = $(document.createElement('div'));
        pageTitle = $(document.createElement('div'));

        iconContainer.addClass('iconContainer ' + pagesData[value].icon);
        pageTitle.addClass('page-title').html(pagesData[value].caption);
        boxImage.addClass('box-image');
        iconContainer.attr('rel', pagesData[value].json);

        boxImage.appendTo(iconContainer);
        pageTitle.appendTo(iconContainer);
        iconContainer.appendTo(mainContainer);
        //     $('.lightbox.lightbox_window_width').centerWithNavigation();
        //     $('div#lightbox_toolkit_lb').css('visibility', 'visible');
        //     $('div#lightbox_toolkit_lb').addClass('box_lightBox');
      });
    }
    $('div#lightbox_toolkit_lb .lightbox_title_data').html(app.getPackageData().packageData[0].toolkit.config.box_header);
    imgConatainer.appendTo('div.lightbox_window_width .lightbox_content_container');
    pointerContainer.appendTo('div.lightbox_window_width .lightbox_content_container');
    mainContainer.appendTo('div.lightbox_window_width .lightbox_content_container');
    $('.lightbox.lightbox_window_width').centerWithNavigation();
    $('div#lightbox_toolkit_lb').css('visibility', 'visible');
    $('div#lightbox_toolkit_lb').addClass('box_lightBox');
    $('#lightbox_toolkit_lb.box_lightBox .iconContainer').unbind('click').bind('click', function() {
      buildPageTemplate({
        'target': this,
        'text': '<span class="link box_text">' + app.getPackageData().packageData[0].toolkit.config.box_header + '</span> > ' + $(this).text()
      });
    });
  }

  function init() {
    // Check to see if the toolkit exists for this package
    //    if (app.getPackageData().packageData[0].toolkit !== undefined && app.getPackageData().packageData[0].toolkit.length !== 0)
    //     {
    //      buildToolkit();
    //      buildThings();
    //     }
    delegateToolkit();
  }

  function getConfig() {
    return _config;
  }

  function getData() {
    return _data;
  }

  function loadAndRender() {
    var test = new TestManager({
      link: app,
      testData: {
        data: getData().questions
      },
      testName: app.getPageName() //'SP_SC05b_02_freeWrite' //app.getPageName()
    });

    app.template.loadGlobals();
    app.setTest(test);
    app.getTest().render();

    bindLearnerName();
    $('body').trigger('runUnitTests');
    //    
    //    var test = new TestManager({
    //                                'link' : app,
    //                                'test' : {
    //                                          'data' : getData().questions
    //                                         }
    //                               });
    //    app.setTest(test);
    //    app.getTest().render();
    //    
    //    $('body').trigger('runUnitTests');
  }

  function loadCSS(url) {
    //    console.info('@Template.loadCSS()');
    $('#lightboxTemplateCSS').remove();

    // Load template CSS
    if ($('#lightboxTemplateCSS').length < 1) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = app.baseURL + 'resources/templates/' + url + '/' + url + '.css';
      css.type = 'text/css';
      css.id = 'lightboxTemplateCSS';
      document.getElementsByTagName('head')[0].appendChild(css);
    } else {
      $('#lightboxTemplateCSS').attr({
        'href': app.baseURL + 'resources/templates/' + url + '/' + url + '.css'
      });
    }
  }

  function loadJS(args) {
    var args = args || {},
      cached = args.cached || false,
      callback = args.callback || undefined,
      prefix = args.prefix || '#data_',
      template = args.template || '';

    $('#lightboxTemplateJS').remove();

    $.ajax({
      async: true,
      url: app.baseURL + 'resources/templates/' + template + '/' + template + '.js',
      dataType: 'script',
      success: function(data) {
        var lightboxHeight = $('div#lightbox_toolkit_lb').height() || 500;

        if (callback !== undefined) {
          callback();
        }

        if (cached === false) {
          app.template.bindData({
            callback: function() {
              $('.lightbox.lightbox_window_width').centerWithNavigation();

              //Show lightbox
              $('div#lightbox_toolkit_lb').css('visibility', 'visible');

              // setTimeout (zero delay) used to help ensure centering function has completed.
              // TODO: The centering function should take a callback.
              setTimeout(function() {
                $('div#lightbox_toolkit_lb').css({
                  //opacity : 0,
                  visibility: 'visible'
                });
                //                                                                                                     .animate({
                //                                                                                                               opacity : 100
                //                                                                                                              }, 3500/*, function()
                //                                                                                                                        {
                //                                                                                                                         $('div#lightbox_toolkit_lb').appendTo('div#main_container');
                //                                                                                                                        }*/);
              });
            },
            prefix: prefix,
            //source is template json
            source: getData().content[0]
          });
        }

        // Check if we are in spanish or history
        // #main_container height is set in CSS for history, spanish will use dynamic resizing
        if (app.template.getData().metadata[0].cssSkin === 'spanish') {
          if (($('div#lightbox_toolkit_lb').height() + 100) > ($(window).height())) {
            $('body').find('div#main_container:eq(1)').css('height', ($('div#lightbox_toolkit_lb').height() + 62))
              .addClass('toolkitIEFix');
            // Fix img paths when lightbox loads
            app.template.fixImgPaths('div#lightbox_data_emailBody p');
          }
        } else {
          if (lightboxHeight > ($(window).height() - 322)) {
            //Add toolkitActive class in main_conainer for bottom padding (navigation) 
            $('body').find('div#main_container:eq(1)').addClass('toolkitActive');
          }
        }

        // Allow for 30 ms for content to load, this is only needed for atlas templates
        // min-width is set on #lightbox_toolkit_lb to save some odd looking loading
        // Seems that only the atlas is the only template affected so I've moved centering to that template -kc
        setTimeout(function() {
          $('.lightbox.lightbox_window_width').centerWithNavigation();
        }, 200);
      }
    });
  }

  /**
   * Pluginize's template html data for lightbox use
   * @param args
   * @returns jquery object
   */
  function pluginizeTemplate(args) {
    var obj = $(args.dom),
      prefixToPrepend = args.prefixToPrepend || 'data_',

      // elements to be removed from lightbox copy
      removal = [
        //                   'main_header_container', // This is actually the title of the template, we'll want to keep it
        'masthead_container',
        'nav_container',
        'navigation_container'
      ],
      removalLength = removal.length;

    // We must wrap object with a div because of a potential jquery bug (jquery's wrap does not work in this case)
    // Without the div, $.each does not traverse every element in the fragment
    // The <div> that we append our fragment to does not appear in the data when its appended
    // TODO: Investigate to see if this is actually a bug or misuse
    var wrapper = document.createElement('div'),
      wrapper = $(wrapper);

    wrapper.append(obj);

    $.each($('*[id^="data_"]', wrapper), function(index, value) {
      if ($(this).attr('id').search(prefixToPrepend) > -1) {
        $(this).attr('id', "lightbox_" + $(this).attr('id'));
      }
    });

    // Search for elements to remove and then remove them
    for (var x = 0; x < removalLength; x++) {
      wrapper.find('div#' + removal[x]).remove();
    }

    return wrapper;
  }

  function renderCachedContents(args) {
    var callback = args.callback,
      cache = args.cache,
      cssSkin = app.getCache()[cache].cssSkin,
      htmlData = app.getCache()[cache].html,
      pageType = app.getCache()[cache].template,
      pageClasses;

    if (app.getCache()[cache].json.questionConfig) {
      pageClasses = pageType ? (pageType + ' ' + app.getCache()[cache].json.questionConfig.type) : app.getCache()[cache].json.questionConfig.type;
    }

    // Empty previous data in lightbox so we don't duplicate
    // Pluginize template so we dont conflict with other DOM elements
    // & append to lightbox
    var template = pluginizeTemplate({
      dom: htmlData,
      prefixToPrepend: 'data_'
    });

    // Load this templates CSS
    loadCSS(pageType);

    $('div.lightbox_window_width .lightbox_content_container').empty().append(template);

    // console.warn('CACHE:')
    //   console.debug(app.getCache())
    // Do not execute template javascript loading until we are sure that the htmlData fragment has been appended
    $('#lightbox_content_container > #main_container').ready(function() {
      // Do not reload and re-execute the template js if its active
      if (app.template.getData().metadata[0].template !== pageType) {
        loadJS({
          cached: true,
          callback: callback,
          prefix: '#lightbox_data_',
          template: pageType //app.getCache()[cache].template
        });
        if (args.callFrom && $(args.callFrom.target).hasClass('iconContainer')) {
          $('div#lightbox_toolkit_lb .lightbox_title_data').text(args.callFrom.text);
          bindToolkitIcons();
        }
      }
      $('div#lightbox_toolkit_lb').css('visibility', 'visible');
      $('.lightbox.lightbox_window_width').centerWithNavigation();
    });

    // Add class of the template type AND cssSkin incase we need to do some lightbox specific CSS for a class (example: point/counterpoint)
    $('div#lightbox_toolkit_lb').addClass(pageType + ' ' + pageClasses);
    $('div#lightbox_toolkit_lb').addClass(cssSkin);
  }

  function renderContents(args) {
    var callback = args.callback,
      json = args.json;

    // If we are passed a reference then load that json file
    if (typeof json === 'string') {
      // Load json content
      //   after, load html, css, js
      $.ajax({
        url: '/s3scorm/ale/content/data/' + json + '.json',
        dataType: 'json',
        success: function(responseText) {
          var templateData = responseText;

          if (app.template.getData(app.getPageName()).metadata[0].template === 'video' && responseText.metadata[0].template === 'interview') {
            // Removed flow_player reference
            // $('#data_videoURL a.flowplayer').removeClass('flowplayer');
            // We are removing video-js class for same reason we are removing above class -- currently unknown why above class removed TODO
            $('#data_videoURL .video-js').removeClass('video-js');
          }

          setData(responseText);
          loadCSS(responseText.metadata[0].template);
          // Load html content, clean html w/ pluginizeTemplate
          $.ajax({
            url: app.baseURL + 'resources/templates/' + responseText.metadata[0].template + '/' + responseText.metadata[0].template + '.html',
            dataType: 'html',
            success: function(responseText) {
              var htmlData = responseText;

              // Empty previous data in lightbox so we don't duplicate
              // Pluginize template so we dont conflict with other DOM elements
              // & append to lightbox
              var template = pluginizeTemplate({
                dom: htmlData,
                prefixToPrepend: 'data_'
              });

              $('div.lightbox_window_width .lightbox_content_container').empty()
                .append(template);

              // Do not execute template javascript loading until we are sure that the htmlData fragment has been appended
              $('#lightbox_content_container > #main_container').ready(function() {
                loadJS({
                  callback: callback,
                  prefix: '#lightbox_data_',
                  template: templateData.metadata[0].template
                });
                if (args.callFrom && $(args.callFrom.target).hasClass('iconContainer')) {
                  $('div#lightbox_toolkit_lb .lightbox_title_data').prepend(args.callFrom.text);
                  bindToolkitIcons();
                }
              });

              // Add class of the template type AND cssSkin incase we need to do some lightbox specific CSS for a class (example: point/counterpoint)
              $('div#lightbox_toolkit_lb').addClass(templateData.metadata[0].template);
              $('div#lightbox_toolkit_lb').addClass(templateData.metadata[0].cssSkin);
            }
          });
        }
      });
    }
  }

  /*
   * function to be called when lightbox dismissed on click close icon or press escape key.
   */
  function onLightboxClose() {
    console.log('lighbox closed');
    // If we are on a counterpoint page then display the flash underneath (see lightbox invocation regarding webkit)
    $('body.counterpoint #data_timeline').show();

    $('div.toolkitIEFix').removeAttr('style')
      .removeClass('toolkitIEFix');

    $('div.toolkitActive').removeClass('toolkitActive');

    $('#lightboxTemplateCSS, div#Glossary.contextual_view').remove();

    // Remove main lightbox, causes event delegation issues otherwise
    $('div#modal').css('display', 'none');
    clearData();
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
    //   //     alert(e)
    // }
    // below code is for videoplayer
    app.template.videoplayerHelper().pauseOtherVideo();
    var videoPlayerId;
// removed flow_player reference
    // find the visible flowplayer at current page and load it.
    // var flowplayerId;
    // if (flowplayerId = $('#data_videoURL .flowplayer').attr('id')) {
    //   $('div#lightbox_toolkit_lb').hide();
    //   $('div#lightbox_things_lb').hide();
    //   $f(flowplayerId).unload(function() {
    //     $('div#lightbox_toolkit_lb').remove();
    //     $('div#lightbox_things_lb').remove();
    //   });
    // } else 
    if (videoPlayerId = $('#data_videoURL .video-js').attr('id')) {
      //  Followed same logic as per flowplayer
      // console.log('disposed videoplayer id is: '+ videoPlayerId);
      $('div#lightbox_toolkit_lb').hide();
      $('div#lightbox_things_lb').hide();
      // videojs(videoPlayerId).dispose();
      // No need 
      $('div#lightbox_toolkit_lb').remove();
      $('div#lightbox_things_lb').remove();
    } else {
      $('div#lightbox_toolkit_lb').hide();
      $('div#lightbox_things_lb').hide();

      // DOM delay needed so that IE7/8 has time to remove the flowplayer instance if one is loaded
      setTimeout(function() {
        $('div#lightbox_toolkit_lb').remove();
        $('div#lightbox_things_lb').remove();
      }, 0);
    }

    if (app.template.getData().metadata[0].template === 'interview' || app.template.getData().metadata[0].template === 'video') {
      app.goToPage();
    }

    return false;
  }

  function scaffoldLightbox(args) {
    var callback = args.callback || function() {},
      template = args.template;

    //    app.setCache({
    //                  template : app.template.getData()
    //                 });

    // Remove previous lightbox if it exists
    $('.lightbox:not(.toolkit_ignore)').remove();
    $('.lightbox:has(.toolkit_ignore)').css('display', 'none');

    // Hide the underlying flash if we are on a counterpoint pageType.
    // Solves an issue with webkit browsers where you cannot click on the markers within a google maps canvas. (when google maps is loaded on top of flash)
    $('body.counterpoint #data_timeline').hide();


    //load lightbox
    app.lightbox.render({
      'global': app,
      'id': 'toolkit_lb',
      'data': {
        'type': 'toolkit'
      },
      'callback': function() {
        if (app.getCache()[template] !== undefined) {
          renderCachedContents({
            callback: callback,
            cache: template,
            callFrom: args.callFrom
          });

          $('.lightbox.lightbox_window_width').centerWithNavigation();
        } else {
          renderContents({
            callback: callback,
            json: template,
            callFrom: args.callFrom
          });
        }
      },
      'size': 'lightbox_window_width',
      'position': {
        'type': 'auto',
        'x': '2.5',
        'y': '5'
      }
    });

    // Clean up CSS/JS so there won't be any issues with separate lightboxes or templates
    $('#lightbox_toolkit_lb a.close, #modal').unbind('click').bind('click', onLightboxClose);
    $(document).unbind('keydown.toolkit')
      .bind('keydown.toolkit', function(e) {
        if (e.keyCode === 27) {
          onLightboxClose();
          return false;
        }
      });
  }

  function setConfig(args) {
    _config = $.extend({
      'active': false,
      'link': this,
      'pageName': 'Toolkit'
    }, args);
  }

  function setData(value) {
    _data = value;
  }
}