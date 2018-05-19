/**
 * @class Interview template class
 * @param app
 * @returns {Interview}
 */
function Interview(app) {
    // Private vars
    // ------------
    var activeTemplate = undefined,
      lightboxPrefix = '',
      _data;
  
    if ($('#lightbox_toolkit_lb.interview').length > 0) {
      lightboxPrefix = '#lightbox_toolkit_lb ';
    } else {
      lightboxPrefix = ''
    }
  
    /**
     * @method buildAccordion
     * @description Builds out the accordion that contains the groups and links for each video.
     * 
     * @returns {jquery object}
     */
    var buildAccordion = function() {
      var excerpt = $(document.createElement('div')),
        h3 = $(document.createElement('h3')),
        ul = $(document.createElement('ul')),
        wrapper = $(document.createElement('div'));
  
      h3.html('<a></a>');
  
      excerpt.addClass('excerpt')
        .append(ul);
  
      wrapper.addClass('accordion')
        .append(h3)
        .append(excerpt);
  
      this.wrapper = wrapper;
  
      this.fill = function(args) {
        var data = args.data,
          val;
  
        for (val in data) {
          var clone = $(wrapper).children('div.excerpt:eq(0)').clone(),
            h3 = $(wrapper).children('h3:eq(0)').clone(),
            ul;
  
          ul = clone.children('ul');
  
          h3.html(data[val].header)
            .appendTo(wrapper);
  
          //                                         $.each(val.videos, function(index, value)
          for (value in data[val].videos) {
            var a = $(document.createElement('a')).attr('href', '#')
              .html(data[val].videos[value].title),
              li = $(document.createElement('li')),
              span = $(document.createElement('span')).addClass('status');
  
            li.append(a, span);
  
            ul.append(li);
          };
  
          clone.append(ul)
            .appendTo(wrapper);
  
        }
  
        //                                       $.each(data, function(i, val)
        //                                                     {
        //                                                      var clone = $(wrapper).children('div.excerpt:eq(0)').clone(),
        //                                                          h3 = $(wrapper).children('h3:eq(0)').clone(),
        //                                                          ul;
        //                                                      
        //                                                      ul = clone.children('ul');
        //                                                      
        //                                                      h3.html(val.header)
        //                                                        .appendTo(wrapper);
        //                                                      console.debug(val.videos)
        //                                                      $.each(val.videos, function(index, value)
        //                                                                          {
        //                                                                           var a = $(document.createElement('a')).attr('href', '#')
        //                                                                                                                 .html(value.title),
        //                                                                               li = $(document.createElement('li')),
        //                                                                               span = $(document.createElement('span')).addClass('status');
        //                                                                           
        //                                                                           li.append(a, span);
        //                                                                           
        //                                                                           ul.append(li);
        //                                                                          });
        //                                                      
        //                                                      clone.append(ul)
        //                                                           .appendTo(wrapper);
        //                                                     });
  
        // Remove template that was cloned
        $(wrapper).children('h3:eq(0)').remove();
        $(wrapper).children('div.excerpt:eq(0)').remove();
  
        return wrapper;
      };
    };
    /**
     * Does event binding for each link as well as transcripts when they are loaded.
     */
    function bindEvents() {
      $('div.excerpt ul li a').unbind()
        .bind('click', function() {
          var data = getData().paneGroups,
            groupId = $(this).parent('li').parent('ul').parent('div.excerpt').index('div.excerpt'),
            linkId = $(this).index('div.excerpt:eq(' + groupId + ') ul li a');
  
          setVideo({
            file: data[groupId].videos[linkId].file.content,
            groupId: groupId,
            linkId: linkId
          });
  
          return false;
        });
  
      // $('#data_videoURL, #lightbox_data_videoURL').click(function()
      //                                                     {
      //                                                      setVideo();
      //                                                     });
  
      $('a.nextVideo').bind('click', function() {
        if ($('div.excerpt li a.active').length === 0) {
          $('div.excerpt li a:eq(0)').trigger('click');
          return false;
        } else {
          var activeGroup = $('div.excerpt:has(a.active)').index('div.excerpt'),
            currentActiveGroup = ($('div.excerpt:has(a.active)').index('div.excerpt') + 1),
            currentActiveLink = ($('a.active').index('div.excerpt:has(a.active) a') + 1),
            totalGroups = $('div.excerpt').length,
            totalLinks = $('div.excerpt li a').length;
  
          // If we've reached the last link then move to the next accordion pane
          if ($('div.excerpt:has(a.active) li a').length === currentActiveLink) {
            // Check if another group exists
            if (currentActiveGroup < totalGroups) {
              $('div.accordion').one('accordionchange', function() {
                $('div.excerpt:eq(' + currentActiveGroup + ') a:eq(0)').trigger('click');
              });
  
              $('div.accordion h3:eq(' + currentActiveGroup + ')').trigger('click');
            } else {
              $('div.accordion').one('accordionchange', function() {
                $('div.excerpt:eq(0) a:eq(0)').trigger('click');
              });
  
              $('div.accordion h3:eq(0)').trigger('click');
            }
          } else {
            $('div.excerpt:eq(' + activeGroup + ') li a:eq(' + ($('div.excerpt li a.active').index('div.excerpt:has(a.active) li a') + 1) + ')').trigger('click');
          }
  
          return false;
        }
      });
    }
  
    /**
     * Creates a button that gets bound to play the next video.
     */
    function nextButton() {
      var container = $(document.createElement('div')),
        button = $(document.createElement('a'));
  
      container.addClass('button_container')
        .append(button.attr('href', '#').addClass('nextVideo'));
  
      return container;
    }
  
    function getData() {
  
      //    if ($('#lightbox_toolkit_lb.interview').length > 0)
      //     {
      //      data = app.toolkit.getData().content[0];
      //     }
      //    else
      //     {
      //      data = app.template.getData().content[0];
      //     }
  
      return _data;
    }
  
    /**
     * Determines if the template has loaded in the toolkit or not.  If so it exits and allows the toolkitInit function to run later.  Otherwise, the accordion gets built and then the event bindings occur.  Optionally, the first video can be forced to play.
     */
    function init() {
      if ($('#lightbox_toolkit_lb').length > 0) {
        return;
      }
  
      setData(app.template.getData().content[0]);
  
      var data = getData().paneGroups;
      // Build accordion cells
      //    if ($('div.accordion').length <= 0)
      //     {
      var accordion = new buildAccordion();
  
      accordion.fill({
          data: data
        })
        .appendTo(lightboxPrefix + 'div#question_content')
        .accordion()
        .append(nextButton());
  
      // Set default video (first one in json paneGroups array)
      //      setVideo();
  
      bindEvents();
  
      if ($.browser.msie === undefined && $.browser.version !== '7.0') {
        DD_roundies.addRule('div#question_content', '10px', true);
        DD_roundies.addRule('div#question_content h3', '10px', true);
        DD_roundies.addRule('div.excerpt', '10px', true);
      }
      //     }
  
      // Simple autoplay fix
      if (data[0].videos[0].autoPlay === undefined || data[0].videos[0].autoPlay !== false) {
        setVideo({
          file: data[0].videos[0].file.content,
          groupId: 0,
          linkId: 0
        });
      }
    }
  
    function setData(args) {
      _data = args;
    }
  
    /**
     * First it will remove the transcript link if it exists, unload any active flowplayer instances, then the logic for loading the new flowplayer commences.  At the end, it is determined if a transcript exists or not.
     * @param args - file, groupId, linkId
     */
    function setVideo(args) {
      args = args || {};
  
      var data = getData().paneGroups,
        DOMelement,
        id,
        file,
        groupId = args.groupId || 0,
        linkId = args.linkId || 0;
      app.template.videoplayerHelper().pauseOtherVideo();
      $('#lightbox_transcript').remove();
      if ($('div#lightbox_data_videoURL').length > 0) {
        id = $('div#lightbox_data_videoURL');
      } else {
        id = $('div#data_videoURL');
      }
  
      file = args.file || data[0].videos[0].file.content;
  
      // Set status    
      $('div.excerpt li span.status').each(function(i, e) {
        if ($(this).html() === '&nbsp;(viewing)') {
          $(this).html('&nbsp;(viewed)');
        }
      });
  
      if ($('#lightbox_toolkit_lb.interview').length > 0) {
        lightboxPrefix = '#lightbox_toolkit_lb ';
      } else {
        lightboxPrefix = ''
      }
  
      // Create a fresh player since one does not exist
      if ($(lightboxPrefix + '.video-js').length === 0) {
        var playerId = "videojs_" + app.template.videoplayerHelper().nextVideoPlayerId();
        //   id.html('<a class="flowplayer" href="/s3scorm/ale/content/assets/' + file + '" id="flowplayer_' + app.template.flowplayerHelper().nextFlowplayerId() + '">&nbsp;</a>');
        id.html('<video class="video-js vjs-big-play-centered" id="' + playerId + '" data-setup={"poster":"/s3scorm/ale/content/assets/flowplay.jpg"}><source src="/s3scorm/ale/content/assets/' + file + '" type="video/mp4"></source></video>')
        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          DOMelement = '#lightbox_toolkit_lb.interview .video-js:eq(0)';
        } else {
          DOMelement = '.video-js:eq(' + ($('.video-js').length - 1) + ')';
        }
        app.template.videoplayerHelper().registerVideoPlayer({
          playerId: playerId,
          DOMelement: DOMelement
        });
        function onPlayerReady() {
          this.on('loadedmetadata', function() {
            // This will set the first (default video) link to active if the play button is clicked in the flowplayer video and the first clip is the same as the first file
            if (this.player().src() === ('/s3scorm/ale/content/assets/' + data[0].videos[0].file.content)) {
              console.log('viewing added');
              $('div.excerpt:eq(0) li:eq(0) span.status').html('&nbsp;(viewing)');
              $('div.excerpt:eq(0) li:eq(0) a').addClass('active');
            }
          })
        }
  
        app.template.videoplayerHelper().initializePlayer(playerId, {
          controls: true,
          autoplay: false,
          preload: 'metadata'
        }, onPlayerReady);

        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          app.template.videoplayerHelper().play(app.template.videoplayerHelper().getVideoPlayerId('#lightbox_toolkit_lb.interview .video-js:eq(0)'));
        } else {
          app.template.videoplayerHelper().play(playerId);
        }
      } else {
        // Since a player exists, just change the source
        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          DOMelement = '#lightbox_toolkit_lb.interview .video-js:eq(0)';
        } else {
          DOMelement = '.video-js:eq(' + ($('.video-js').length - 1) + ')';
        }
        app.template.videoplayerHelper().setClip(app.template.videoplayerHelper().getVideoPlayerId(DOMelement), ('/s3scorm/ale/content/assets/' + file), true);
      }
  
      // Check if the default is loaded, if it is a clicked link then do the first block
      if (args.file !== undefined) {
        $('div.excerpt:eq(' + groupId + ') li:eq(' + linkId + ') span.status').html('&nbsp;(viewing)');
  
        $('div.excerpt li a').removeClass('active');
  
        $('div.excerpt:eq(' + groupId + ') li:eq(' + linkId + ') a').addClass('active');
      } else {
        //  ---------------------------TODO anand-----------------------------------
        // First page load, don't play it by default
        app.template.videoplayerHelper().load(app.template.videoplayerHelper().getVideoPlayerId(DOMelement));
      }
  
      if ($('a.transcript').length > 0) {
        $('a.transcript').remove();
      }
  
      app.template.transcript({
        appendLinkTo: '#main_content_container',
        DOMelement: DOMelement,
        file: file
      });
    }
    /**
     * First it will remove the transcript link if it exists, unload any active flowplayer instances, then the logic for loading the new flowplayer commences.  At the end, it is determined if a transcript exists or not.
     * @param args - file, groupId, linkId
     */
    function setVideoOld(args) {
      args = args || {};
  
      var data = getData().paneGroups,
        DOMelement,
        id,
        file,
        groupId = args.groupId || 0,
        linkId = args.linkId || 0;
  
      $('#lightbox_transcript').remove();
  
      try {
        flowplayer('*').each(function() {
          if (this.isLoaded() === true) {
            this.stop();
            this.close();
            this.unload();
          }
        });
      } catch (e) {
        //     alert(e)
      }
  
      // Removing flowplayer now every time because of compatibility with toolkit
      //   $('a.flowplayer').remove();
  
      if ($('div#lightbox_data_videoURL').length > 0) {
        id = $('div#lightbox_data_videoURL');
      } else {
        id = $('div#data_videoURL');
      }
  
      file = args.file || data[0].videos[0].file.content;
  
      // Set status    
      $('div.excerpt li span.status').each(function(i, e) {
        if ($(this).html() === '&nbsp;(viewing)') {
          $(this).html('&nbsp;(viewed)');
        }
      });
  
      if ($('#lightbox_toolkit_lb.interview').length > 0) {
        lightboxPrefix = '#lightbox_toolkit_lb ';
      } else {
        lightboxPrefix = ''
      }
  
      // Create a fresh player since one does not exist
      if ($(lightboxPrefix + 'a.flowplayer').length === 0 || $('a.flowplayer:has(.reloaded)').length >= 1) {
        id.html('<a class="flowplayer" href="/s3scorm/ale/content/assets/' + file + '" id="flowplayer_' + app.template.flowplayerHelper().nextFlowplayerId() + '">&nbsp;</a>');
  
        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          DOMelement = '#lightbox_toolkit_lb.interview a.flowplayer:eq(0)';
        } else {
          DOMelement = 'a.flowplayer:eq(' + ($('a.flowplayer').length - 1) + ')';
        }
  
        app.template.flowplayerHelper().registerFlowplayer({
          playerId: $f('*').length,
          DOMelement: DOMelement
        });
  
        $(DOMelement).flowplayer({
          src: app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
          wmode: 'opaque'
        }, {
          clip: {
            autoPlay: false,
            onStart: function(clip) {
              // This will set the first (default video) link to active if the play button is clicked in the flowplayer video and the first clip is the same as the first file
              if (clip.url === ('/s3scorm/ale/content/assets/' + data[0].videos[0].file.content)) {
                $('div.excerpt:eq(0) li:eq(0) span.status').html('&nbsp;(viewing)');
  
                $('div.excerpt:eq(0) li:eq(0) a').addClass('active');
              }
            }
          }
        });
  
        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          //        app.template.flowplayerHelper().load('#lightbox_toolkit_lb.interview a.flowplayer:eq(0)');
          app.template.flowplayerHelper().play('#lightbox_toolkit_lb.interview a.flowplayer:eq(0)');
        } else {
          //        app.template.flowplayerHelper().load(DOMelement);
          app.template.flowplayerHelper().play(DOMelement);
        }
      } else {
        // Since a player exists, just change the source
        if ($('#lightbox_toolkit_lb.interview').length > 0) {
          DOMelement = '#lightbox_toolkit_lb.interview a.flowplayer:eq(0)';
        } else {
          DOMelement = 'a.flowplayer:eq(' + ($('a.flowplayer').length - 1) + ')';
        }
  
        // setClip method does not work correctly, after browsing flowplayer's forum this is the solution to replace setClip:
        app.template.flowplayerHelper().getClip(DOMelement).update({
          autoPlay: true,
          url: ('/s3scorm/ale/content/assets/' + file)
        });
  
        app.template.flowplayerHelper().play(DOMelement);
      }
  
      // Check if the default is loaded, if it is a clicked link then do the first block
      if (args.file !== undefined) {
        $('div.excerpt:eq(' + groupId + ') li:eq(' + linkId + ') span.status').html('&nbsp;(viewing)');
  
        $('div.excerpt li a').removeClass('active');
  
        $('div.excerpt:eq(' + groupId + ') li:eq(' + linkId + ') a').addClass('active');
      } else {
        // First page load, don't play it by default
        app.template.flowplayerHelper().load(DOMelement);
      }
  
      if ($('a.transcript').length > 0) {
        $('a.transcript').remove();
      }
  
      app.template.transcript({
        appendLinkTo: '#main_content_container',
        DOMelement: DOMelement,
        file: file
      });
    }
  
    /**
     * Run by toolkit when the template is invoked from the toolkit bar.
     * @params args - data provided by Toolkit.js.  jsonData, testData, template
     */
    App.prototype.toolkitInit = function(args) {
      // Add the flowplayer class back to the flowplayer video.
      // Removed the flowplayer class in toolkit.js (renderContents) because it was conflicting with what was loading in the toolkit
      $('#data_videoURL a:not(.flowplayer)').addClass('flowplayer');
      $('#data_videoURL :not(.video-js)').addClass('video-js');
  
      setData(args.jsonData.content[0]);
  
      var data = getData().paneGroups;
      // Build accordion cells
      //                                if ($('div.accordion').length <= 0)
      //                                 {
      var accordion = new buildAccordion();
  
      accordion.fill({
          data: data
        })
        .appendTo(lightboxPrefix + 'div#question_content')
        .accordion()
        .append(nextButton());
  
      // Set default video (first one in json paneGroups array)
      //                                  setVideo();
  
      bindEvents();
  
      if ($.browser.msie === undefined && $.browser.version !== '7.0') {
        DD_roundies.addRule('div#question_content', '10px', true);
        DD_roundies.addRule('div#question_content h3', '10px', true);
        DD_roundies.addRule('div.excerpt', '10px', true);
      }
      //                                 }
  
      // Simple autoplay fix
      if (data[0].videos[0].autoPlay === undefined || data[0].videos[0].autoPlay !== false) {
        setVideo({
          file: data[0].videos[0].file.content,
          groupId: 0,
          linkId: 0
        });
      }
// Below piece of code is obsolete as there is no trigger for below code
    //   $('body').one('lightbox.close', function() {
    //     if ($('body.interview #data_videoURL').length > 0) {
    //       setVideo();
    //       return;
    //     }
  
    //     if ($('body.video #data_videoURL').length > 0) {
    //       var flowplayerHTML = $('#data_videoURL').html();
  
    //       $('#data_videoURL').html(flowplayerHTML.replace(/(&nbsp;)*/g, ""));
  
    //       app.template.flowplayerHelper().registerFlowplayer({
    //         playerId: $f('*').length,
    //         DOMelement: 'a.flowplayer:eq(0)'
    //       });
  
    //       $('a.flowplayer:eq(0)').flowplayer({
    //         src: app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
    //         wmode: 'opaque'
    //       }, {
    //         clip: {
    //           'autoPlay': false
    //         }
    //       });
    //     }
    //   });
    };
  
    // One-time setup
    // --------------
    init();
  }
  
  App.prototype.thisTemplate = new Interview(ale);