function Template(app)
 {
  // Private vars
  // ------------
  var console = app.console,
      
      // Holds the entire JSON data for the current template
      _data = {},
      
      _globalBase = 'global',
      _globalQuestionBank = [],
      
      _currentFlowplayerId = 0,
      _pageName = 'template',
      _previousTemplateNameBodyClass = 'home',
      _previousTemplateSkinBodyClass = '',
      _flowplayers = [],
      _currentVideoPlayerId = 0,
      _videoPlayers= [],
      test;
  
  // Private methods
  // ---------------
  /**
   * Round the progress indicator's corners
   * @method applyGlobalMasthead
   * @return undefined
   */
  function applyGlobalMasthead()
   {
    Nifty('div#masthead_progress_bar');
   }
  
  /**
   * Bind navigation links
   * @method applyGlobalNav
   * @return undefined
   */
  function applyGlobalNav()
   {
    // Add return to LMS link
    $('#return_to_LMS').attr({
                              'href' : app.externalConfig.saveAndExitUrl
                             })
                       .unbind('click')
                       .bind('click', function (e)
                                       {
                                        window.parent.parent.parent.location.href = app.externalConfig.saveAndExitUrl;
                                        return false; 
                                       });
    
    $('a.ALE_next').unbind('click')
                                  .bind('click', function ()
                                                  {
                                                   if(!$(this).hasClass('disabled')){
						    $(this).addClass('disabled');
                                                    app.doNext();
                                                   }
                                                   return false;
                                                  });
                                                  
    $('a.ALE_previous').unbind('click')
                                      .bind('click', function ()
                                                      {
                                                       if(!$(this).hasClass('disabled')){
							$(this).addClass('disabled');
                                                        app.doPrevious();
                                                       }
                                                       return false;
                                                      });
    
    if($('#nav_container').length)
     {
      $('#nav_right_btn, #nav_next_link').unbind('click')
                         .bind('click', function()
                                         {
                                          if(!$(this).hasClass('disabled')){
					   $(this).addClass('disabled');
                                           app.doNext();
                                          }
                                         });
     }                                                      
                                                      
    $('a.ALE_goToPage').unbind('click')
                       .bind('click', function ()
                                       {
                                        app.setCurrentPage($(this).attr('title') - 1);
                                        app.goToPage();
                                        return false;
                                       });
                                       
    $('a.ALE_save_and_exit, a.ALE_finish').unbind('click')
                                          .bind('click', function ()
                                                          {
                                                           if(confirm("Are you sure you want to exit this activity?\n\n(Your progress will be saved)")) {
                                                             app.doUnload();
                                                             //app.setCurrentPage(app.getPageArray().length - 1);
                                                             //app.goToPage();
                                                            }
                                                           return false;
                                                          });
    
    // selector scope is the container, and check if the "target" has class disabled to stop the event.
    /*$($('#navigation_container').length ? '#navigation_container' : '#nav_container' + ' .disabled').unbind('click')
                                                                                                    .bind('click', function (args)
                                                                                                                    {
                                                                                                                     if($(args.target).hasClass('disabled'))
                                                                                                                      {
                                                                                                                       return false;    
                                                                                                                      }
                                                                                                                    });*/
                                  
    $('#page_array_container').hide();
    
    $('#menu_button, #nav_menu_close').unbind('click')
                                      .bind('click', function ()
                                                      {
                                                       $('#menu_button').toggleClass('active');
                                                       $('#page_array_container').toggle();
                                                       //$('#page_array_container').css('display') === 'none' ? $('#data_media_content').css({"visibility":"visible"}) : $('#data_media_content').css({"visibility":"hidden"});
                                                       return false;
                                                      });
                                                      
    DD_roundies.addRule('#nav_menu_header', '5px 5px 0px 0px', true);
   }

  function bindData(args)
   {
    args = args || {};
    
    var callback = args.callback || undefined,
        DOMelement,
        source = args.source || '',
        html = [],
        prefix = args.prefix || '#data_',
        thisFlowplayerIndex;
    
    // Ensure that custom prefix is applied to nested elements (nested within JSON node string content)
    // Otherwise elements will not get bound correctly within lightboxes
    // NOTE TO FUTURE SELF: Though I don't like using regex here, it is the best option since it modifies the HTML
    // as a string before it becomes a DOM element preventing potential duplicate IDs. -DP
    if (args.prefix !== undefined)
     {
      // Removes initial hash character, then removed following "data_"
      var prepend = prefix.replace(/^[^a-zA-Z 0-9_]/g, '').replace(/data_$/g, '');
      
      $.each(source, function(key, value)
                      {
                       if (typeof source[key] === 'string')
                        {
                         var fragment = $(document.createElement('div')).html(source[key]);
                         
                         fragment.find('*[id^="data_"]').each(function()
                                                               {
                                                                $(this).attr('id', prepend + $(this).attr('id'));
                                                               });
                         
                         // If we get back no contents, then probably something went terribly wrong...so abort!
                         source[key] = fragment.html() || source[key];
                        }
                      });
     }
     
    $.each(source, function (prop, value)
                    {
                     if (typeof(source[prop]) === 'string') {
                      
                      /**
                        * Check for the type of the DOM object to be operated on.
                        * input = set .val()
                        * img = set .src()
                        * anything else = set .html()
                        */
                       if ($(prefix + prop).is('img')) {
                         $(prefix + prop).attr({
                                                 src : '/s3scorm/ale/content/assets/' + source[prop]
                                                });
                                                 
                         $(prefix + prop).attr({
                                                alt : prop
                                               });
                                                 
                         $(prefix + prop).attr({
                                                title : prop
                                               });
                        } else if ($(prefix + prop).is('a')) {
                         $(prefix + prop).html(source[prop]);
                         $(prefix + prop).attr({
                                                title : prop
                                               });
                        } else if($(prefix + prop).is('input')) {
                         $(prefix + prop).val(source[prop]);
                        } else {
                         $(prefix + prop).html(source[prop]);
                        }
                      } else {
                       switch (source[prop].type) {
                         case 'audio' :
                          var options = {};
                          
                          html = [];
                          
                          // Ensure HTML element exists
                          if ($(prefix + prop).length < 1) {
                            return;
                           }
                          
                          html.push('<a class="flowplayer" href="', '/s3scorm/ale/content/assets/', source[prop].content, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
                          html.push('&nbsp;</a>');
                          
                          $(prefix + prop).append(html.join(''));
                          
                          thisFlowplayerIndex = $('a.flowplayer').length - 1;
                          // This DOM element wasn't matching with the format used on freeWrite
                          DOMelement = prefix + prop + ' a.flowplayer';
                          // ..this change broke clickPic audio players, so I made the change to freeWrite to use this (original) format
//                          DOMelement = 'a.flowplayer:eq(' + thisFlowplayerIndex + ')';
                          
                          // Register DOMelement to flowplayer id
                          flowplayerHelper().registerFlowplayer({
                                                                 playerId : $f('*').length,
                                                                 DOMelement : DOMelement
                                                                });
                          
                          // Options to set for flowplayer
                          if (app.getPackageData().packageData[0].flowplayer !== undefined)
                           {
                            $.extend(options, app.getPackageData().packageData[0].flowplayer);
                           }
                          
                          // Creating flowplayer
                          $(DOMelement).flowplayer({
                                                    allowfullscreen : 'false',
                                                    src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
                                                    wmode : 'opaque'
                                                   },
                                                   {
                                                    plugins : {
                                                               controls : {
                                                                           fullscreen : false,
                                                                           height : 30,
                                                                           autoHide : false
                                                                          }
                                                              },
                                                    clip : options || {
                                                                       autoPlay : true
                                                                      }
                                                   });
                          
                          // Commenting the below section out because it appears to do absolutely nothing
                          // Play immediately
//                          if (app.thisTemplate.disableFlowplayerAutoplay) {
//                            // do nothing
//                           }
                          
                          if (options.autoPlay === true)
                           {
                            flowplayerHelper().play(DOMelement);
                           }
                          else
                           {
                            flowplayerHelper().load(DOMelement);
                           }
                          
//                        Check if a transcript exists for this video
                          //regex to remove file extension then then look for file with that name to load
                          $.ajax({
                                  url: '/s3scorm/ale/content/assets/' + source[prop].content.replace(/\.[0-9a-z]+$/i, '.txt'),
                                  cache: false,
                                  dataType: 'txt',
                                  success: function(txt)
                                            {
                                             $('div.lightbox.normal.centered').css('height', '495px');
                                             $(document.createElement('a')).addClass('transcript')
                                                                           .bind('click', function()
                                                                                           {
                                                                                            if ($(this).text() === 'View Transcript')
                                                                                             {
                                                                                              $(document.createElement('div')).addClass('transcript')
                                                                                                                              .html(txt)
                                                                                                                              .appendTo('div.lightbox.centered.normal div.lightbox_content_container');
                                                                                              
                                                                                              setTimeout(function()
                                                                                                          {
                                                                                                           $('div.lightbox.centered.normal').centerWithNavigation();
                                                                                                          }, 0);
                                                                                              
                                                                                              $('div.lightbox.normal.centered').css('height', 'auto');
                                                                                              
                                                                                              $('a.transcript').text('Hide Transcript');
                                                                                             }
                                                                                            else
                                                                                             {
                                                                                              $('a.transcript').text('View Transcript');
                                                                                              
                                                                                              $('div.transcript').remove();
                                                                                              
                                                                                              $('div.lightbox.normal.centered').css('height', '495px');
                                                                                              
                                                                                              setTimeout(function()
                                                                                                          {
                                                                                                           $('div.lightbox.centered.normal').centerWithNavigation();
                                                                                                          }, 0);
                                                                                             }
                                                                                           })
                                                                           .text('View Transcript')
                                                                           .attr('href', '#')
                                                                           .css('margin-left', '0')
                                                                           .appendTo('div.lightbox.centered.normal div.lightbox_content_container');
                                            }
                                });
                          break;
                          
                         case 'audio.old' :
                          html = [];

                          // Ensure HTML element exists
                          if ($(prefix + prop).length < 1) {
                            return;
                           }
                          
                          // If the player already exists, just play it, don't rebuild it
                          if ($(prefix + prop + ' a.flowplayer').length > 0) {
                            DOMelement = prefix + prop + ' a.flowplayer';
                                
                            flowplayerHelper().play(DOMelement);
                            return;
                           }
                          
                          html.push('<a class="flowplayer" href="/s3scorm/ale/content/assets/', source[prop].content, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
                          html.push('&nbsp;</a>');
                          
                          $(prefix + prop).append(html.join(''));
                          
                          DOMelement = prefix + prop + ' a.flowplayer';
                          
                          flowplayerHelper().registerFlowplayer({
                                                                 playerId : $f('*').length,
                                                                 DOMelement : DOMelement
                                                                });
                          
                          $(DOMelement).flowplayer({
                                                    src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
                                                    wmode : 'opaque'
                                                   },
                                                   {
                                                    plugins : {
                                                               audio : {
                                                                        url : app.baseURL + 'resources/js/lib/flowplayer/flowplayer.audio-3.2.0.swf'
                                                                       }
                                                              },
                                                    clip : {
                                                            autoPlay : false
                                                           }
                                                   });
                          
                          flowplayerHelper().play(DOMelement);
                          
                          break;
                          
                         case 'clickPic' :
                          $(prefix + prop).css('background-image', 'url(/s3scorm/ale/content/assets/' + source[prop].value + ')');
                          
                          break;
                         
                         case 'file_download' :
                          $(prefix + prop).html('<a href="' + source[prop].content + '" class="file_download">' + source[prop].title + '</a>');
                          break;
                          
                         case 'image' : 
                          html = [];
                          
                          html.push('<img src="', '/s3scorm/ale/content/assets/', source[prop].content, '" alt="', source[prop].content, '" title="', source[prop].content, '">');
                          
                          $(prefix + prop).html(html.join(''));
                          break;
                          
                         case 'swf' :
                          var options = {};
                          
                          html = [];
                          
                          createSwf({
                                     html : html,
                                     options : options,
                                     prefix : prefix,
                                     prop : prop,
                                     source : source
                                    });
                          
                          break;
                          
                         case 'swf_lightbox' :
                          // Remove previous lightbox if it exists
                          $('div.lightbox').remove();
                          
                          // Load lightbox
                          app.lightbox.render({
                                               global : app,
                                               id : 'toolkit_lb',
                                               data : {
                                                       type : 'toolkit',
                                                       content : {
                                                                  title : '',
                                                                  header : ''
                                                                 }
                                                      },
                                               callback : function()
                                                              {
                                                               var html = [];
                                                               
                                                               // Ensure HTML element exists
                                                               if ($(prefix + prop).length < 1) {
                                                                 return;
                                                                }
                                                                
                                                               html.push('<a class="flowplayer" href="/s3scorm/ale/content/assets/', source[prop].content, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
                                                               html.push('&nbsp;</a>');
                                                               
                                                               $('div.lightbox_content_container').html(html.join(''));
                                                               
                                                               thisFlowplayerIndex = $('a.flowplayer').length - 1;
                                                               DOMelement = 'a.flowplayer:eq(' + thisFlowplayerIndex + ')';
                                                               
                                                               flowplayerHelper().registerFlowplayer({
                                                                                                      playerId : $f('*').length,
                                                                                                      DOMelement : DOMelement
                                                                                                     });
                                                                                                     
                                                               $(DOMelement).flowplayer({
                                                                                         src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
                                                                                         wmode : 'opaque'
                                                                                        },
                                                                                        {
                                                                                         clip : {
                                                                                                 'autoPlay' : true
                                                                                                }
                                                                                        });
                                                                                        
                                                               $('.lightbox_content_container a.flowplayer').css('height', '390px')
                                                                                                            .css('margin', 'auto')
                                                                                                            .css('width', '550px');
                                                                                                            
                                                               flowplayerHelper().play(DOMelement);
                                                               
                                                               // Fix for centering code in IE, the outer container is selected for centering instead of the inner
                                                               $('.lightbox').css('height','450px');
                                                               $('.lightbox').css('width','600px');
                                                               $('.lightbox').centerWithNavigation();
                                                               
                                                               $('div#lightbox_toolkit_lb').css({
                                                                                                 opacity : 0,
                                                                                                 visibility : 'visible'
                                                                                                })
                                                                                           .animate({
                                                                                                     opacity : 100
                                                                                                    }, 2500);
                                                              },
                                               size : 'lightbox_window_width'
                                              });
                                              
                          break;
                          
                          case 'swf_toolkit' :
                           if ($('#lightbox_toolkit_lb').length > 0)
                            {
                             return;
                            }
                           
                           // Remove previous lightbox if it exists
                           $('div.lightbox').remove();
                           
                           // Load lightbox
                           app.lightbox.render({
                                                global : app,
                                                id : 'toolkit_lb',
                                                data : {
                                                        type : 'toolkit',
                                                        content : {
                                                                   title : '',
                                                                   header : ''
                                                                  }
                                                       },
                                                callback : function()
                                                               {
                                                                var html = [];
                                                                                                                                
                                                                if (source[prop].dataType === 'image')
                                                                 {
                                                                  html.push('<center><img src="/s3scorm/ale/content/assets/', source[prop].content, '" style="cursor: pointer"></center>');
                                                                  $('div.lightbox_content_container').html(html.join(''));
                                                                  $('.lightbox').css('height','760px');
                                                                  $('.lightbox').css('width','940px');
                                                                  $('.lightbox').centerWithNavigation();
                                                                  
                                                                  $('#lightbox_toolkit_lb a.close, #modal, div.lightbox img').unbind()
                                                                                                                             .one('click', function()
                                                                                                                                             {
                                                                                                                                              // Hide lightbox first because it flies all over the page on unload
                                                                                                                                              $('div.lightbox').remove();
                                                                                                                                              $('#modal').hide();
                                                                                                                                              return false;
                                                                                                                                             });
                                                                  
                                                                  $('div#lightbox_toolkit_lb').css({
                                                                                                    opacity : 0,
                                                                                                    visibility : 'visible'
                                                                                                   })
                                                                                              .animate({
                                                                                                        opacity : 100
                                                                                                       }, 2500);
                                                                 }
                                                                else
                                                                 {
                                                                  // Ensure HTML element exists
                                                                  if ($(prefix + prop).length < 1) {
                                                                    return;
                                                                   }
                                                                  
                                                                  html.push('<a class="flowplayer" href="/s3scorm/ale/content/assets/', source[prop].content, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
                                                                  html.push('&nbsp;</a>');
                                                                  
                                                                  $('div.lightbox_content_container').html(html.join(''));
                                                                  
                                                                  thisFlowplayerIndex = $('a.flowplayer').length - 1;
                                                                  DOMelement = 'a.flowplayer:eq(' + thisFlowplayerIndex + ')';
                                                                  
                                                                  flowplayerHelper().registerFlowplayer({
                                                                                                         playerId : $f('*').length,
                                                                                                         DOMelement : DOMelement
                                                                                                        });
                                                                                                        
                                                                  $(DOMelement).flowplayer({
                                                                                            src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
                                                                                            wmode : 'opaque'
                                                                                           },
                                                                                           {
                                                                                            clip : {
                                                                                                    'autoPlay' : true
                                                                                                   }
                                                                                           });
                                                                                           
                                                                  $('.lightbox_content_container a.flowplayer').css('height', '390px')
                                                                                                               .css('margin', 'auto')
                                                                                                               .css('width', '550px');
                                                                                                               
                                                                  flowplayerHelper().play(DOMelement);
                                                                  
                                                                  // Check if a transcript exists for this video
                                                                  //regex to remove file extension then then look for file with that name to load
                                                                  $.ajax({
                                                                          url: '/s3scorm/ale/content/assets/' + source[prop].content.replace(/\.[0-9a-z]+$/i, '') + '.txt',
                                                                          cache: false,
                                                                          dataType: 'txt',
                                                                          success: function(txt)
                                                                                    {
                                                                                     $('#lightbox_toolkit_lb').css('height', '455px');
                                                                                     $(document.createElement('a')).addClass('transcript')
                                                                                                                   .bind('click', function()
                                                                                                                                   {
                                                                                                                                    if ($(this).text() === 'View Transcript')
                                                                                                                                     {
                                                                                                                                      $(document.createElement('div')).addClass('transcript')
                                                                                                                                                                      .html(txt)
                                                                                                                                                                      .appendTo('div.lightbox_content_container');
                                                                                                                                      
                                                                                                                                      setTimeout(function()
                                                                                                                                                  {
                                                                                                                                                   $('.lightbox').centerWithNavigation();
                                                                                                                                                  }, 0);
                                                                                                                                      
                                                                                                                                      $('#lightbox_toolkit_lb').css('height', 'auto');
                                                                                                                                      
                                                                                                                                      $('a.transcript').text('Hide Transcript');
                                                                                                                                     }
                                                                                                                                    else
                                                                                                                                     {
                                                                                                                                      $('a.transcript').text('View Transcript');
                                                                                                                                      
                                                                                                                                      $('div.transcript').remove();
                                                                                                                                      
                                                                                                                                      $('#lightbox_toolkit_lb').css('height', '455px');
                                                                                                                                      
                                                                                                                                      setTimeout(function()
                                                                                                                                                  {
                                                                                                                                                   $('.lightbox').centerWithNavigation();
                                                                                                                                                  }, 0);
                                                                                                                                     }
                                                                                                                                   })
                                                                                                                   .text('View Transcript')
                                                                                                                   .attr('href', '#')
                                                                                                                   .appendTo('div.lightbox_content_container');
                                                                                    }
                                                                        });
                                                                  
                                                                  // Fix for centering code in IE, the outer container is selected for centering instead of the inner
                                                                  $('.lightbox').css('height','450px');
                                                                  $('.lightbox').css('width','600px');
                                                                  $('.lightbox').centerWithNavigation();
                                                                  
                                                                  $('a.close, #modal').unbind()
                                                                                      .bind('click', function()
                                                                                                      {
                                                                                                       // Hide lightbox first because it flies all over the page on unload
                                                                                                       $('div.lightbox').hide();
                                                                                                       // Continue to the next page
                                                                                                       app.doNext();
                                                                                                       return false;
                                                                                                      });
                                                                  
                                                                  $('div#lightbox_toolkit_lb').css({
                                                                                                    opacity : 0,
                                                                                                    visibility : 'visible'
                                                                                                   })
                                                                                              .animate({
                                                                                                        opacity : 100
                                                                                                       }, 2500);
                                                                  
                                                                  // support for titles
                                                                  $('div.lightbox_title_data').html(source.videoURL.title || '');
                                                                 }
                                                               },
                                                size : 'lightbox_window_width'
                                               });
                                               
                           break;
                          
                         case 'swfObject' :
                          html = [];
                          
                          html.push("<object id='swf_",
                                    prop,
                                    "' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='400' height='220'>",
                                    "<param name='wmode' value='opaque'>",
                                    "<param name='movie' value='/s3scorm/ale/content/assets/",
                                    source[prop].content,
                                    "'><!--[if !IE>--><object type='application/x-shockwave-flash' data='/s3scorm/ale/content/assets/",
                                    source[prop].content,
                                    "' width='400' height='220'><!--<![endif]-->",
                                    "<div><p>Please activate JavaScript to view this content</p></div>",
                                    "<!--[if !IE]>--></object><!--<![endif]--></object>");
                          
                          $(prefix + prop).html(html.join(''));
                          
                          // Call swfobject
                          swfobject.registerObject("swf_" + prop, "9.0.115", source[prop].content, showError);
                          
                          // For some reason, the object element's visibility gets set to hidden so we have to unhide it
                          $('#swf_' + prop).css({'visibility':'visible'});
                          break;
                          
                         case 'swfTimeline' :
                          html = [];
                          
                          html.push("<object id='swf_",
                            prop,
                            "' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='848' height='291'>",
                            "<param name='wmode' value='transparent'>",
                            "<param name='movie' value='/s3scorm/ale/content/assets/",
                            source[prop].content,
                            "' wmode='transparent'><!--[if !IE>--><object type='application/x-shockwave-flash' data='/s3scorm/ale/content/assets/",
                            source[prop].content,
                            "' width='848' height='291' wmode='transparent'><!--<![endif]-->",
                            "<div><p>Please activate JavaScript to view this content</p></div>",
                            "<!--[if !IE]>--></object><!--<![endif]--></object>");
                          
                          $(prefix + prop).html(html.join(''));
                          
                          // Call swfobject
                          swfobject.registerObject("swf_" + prop, "9.0.115", source[prop].content, showError);
                          
                          // For some reason, the object element's visibility gets set to hidden so we have to unhide it
                          $('#swf_' + prop).css({'visibility':'visible'});
                          break;
                          
                         case 'video' :
                          var options = {
                                         controls : true,
                                         autoplay : true
                                        };
                           
                          html = [];
                          
                          // Ensure HTML element exists
                          if ($(prefix + prop).length < 1) {
                            return;
                           }
                          
                          if (isVideoSupported() === false)
                           {
                            createSwf({
                                       html : html,
                                       options : options,
                                       prefix : prefix,
                                       prop : prop,
                                       source : source
                                      });
                            
                            return;
                           }
                          
                          // Push config
                          html.push('<video ', (options.controls === true ? 'controls="controls"' : ''));
                          html.push((options.autoplay === true ? 'autoplay="autoplay"' : ''));
                          html.push('>');
                          
                          // Push files, check if its a single object or an array
                          if (source[prop].content.length !== undefined && typeof source[prop].content === 'object') //array
                           {
                            $.each(source[prop].content, function(index, value)
                                                          {
                                                           html.push('<source src="/s3scorm/ale/content/assets/', value.file, '" type="video/', value.type, '" />');
                                                          });
                           }
                          else //object
                           {
                            if (source[prop].content.file !== undefined)
                             {                              
                              html.push('<source src="/s3scorm/ale/content/assets/', source[prop].content.file, '" type="video/', source[prop].content.type, '" />');
                             }
                            else
                             {
                              //old school - default
                              html.push('<source src="/s3scorm/ale/content/assets/', source[prop].content, '" type="video/mp4" />');
                             }
                           }
                          html.push('your browser doesnt support html5 video');
//                          html.push('<a class="flowplayer" href="', app.baseURL, 'resources/assets/', source[prop].content, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
                          
                          
//                          <video controls="controls" autoplay="autoplay">
//                          <source src="pics/video/gizmo.mp4" type="video/mp4" />
//                          <source src="pics/video/gizmo.webm" type="video/webm" />
//                          <source src="pics/video/gizmo.ogv" type="video/ogg" />
//                          Video not playing? <a href="pics/video/gizmo.mp4">Download file</a> instead.
//                        </video>
                          
                          html.push('</video>');

                          $(prefix + prop).html(html.join(''));
                         break;
                          
                         case 'wrapper' :
                          $(prefix + prop).html('<'+ source[prop].element + '" id="wrapper_' + prop + '">' + source[prop].content + '</' + source[prop].element + '>');
                          break;
                          
                         default : 
                          $(prefix + prop).html(source[prop].content);
                        }
                        
                      }
                      
                    });
    
    if (callback !== undefined) {
      callback();
     }
    
    $('body').trigger('template.bound');
   }

  /**
   * Adds the learner name to any element with a class of showLearnerName
   */
  function bindLearnerName()
   {
    $('.bindLearnerName', 'body.showLearnerName').html(app.scorm.learnerName());
   }
  
  function buildPage(args)
   {
    args = args || {};
    
    var appendTo = args.appendTo || 'body',
        templateName = args.templateName || '';
    
    // Set default global base.  Either default to package.json or just 'global' or if the property exists, from pages.json individual page node
    if (app.getPagesObject().pages[app.getCurrentPage()].branding !== undefined)
     {      
      setGlobalBase(app.getPagesObject().pages[app.getCurrentPage()].branding.globalBase);
     }
    else
     {
      setGlobalBase();
     }
    
    loadCSS(templateName);
    loadHTML({
              appendTo : appendTo,
              url : templateName
             });
   }
  
  function createSwf(args)
   {
    var file,
        html = args.html,
        options = args.options,
        prefix = args.prefix,
        prop = args.prop,
        source = args.source;

    //  Ensure HTML element exists
    if ($(prefix + prop).length < 1) {
      return;
     }
    
    if (typeof source[prop].content === 'object')
     {
      file = source[prop].content[0].file;
     }
    else
     {
      file = source[prop].content;
     }
    
    html.push('<a class="flowplayer" href="/s3scorm/ale/content/assets/', file, '" id="flowplayer_', flowplayerHelper().nextFlowplayerId(), '">');
    html.push('&nbsp;</a>');
    
    $('div' + prefix + prop).append(html.join(''));
    
    thisFlowplayerIndex = $('a.flowplayer').length - 1;
    
    DOMelement = 'a.flowplayer:eq(' + thisFlowplayerIndex + ')';
    
    if (prefix === '#lightbox_data_')
     {
      DOMelement = 'a.flowplayer:eq(0)';
     }
    
    flowplayerHelper().registerFlowplayer({
                                           playerId : $f('*').length,
                                           DOMelement : DOMelement
                                          });
    
    // Options to set for flowplayer
    if (app.getPackageData().packageData[0].flowplayer !== undefined)
     {
      $.extend(options, app.getPackageData().packageData[0].flowplayer);
     }
    
    $(DOMelement).flowplayer({
                              src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
                              wmode : 'opaque'
                             }, 
                             {
                              clip : options || {
                                                 'autoPlay' : true
                                                }
                             });
    
    // Play the flowplayer according to the flag isDefault.
    var isDefault = source[prop].isDefault;
    // Let's assume if the object doesn't have property isDefault as value true
    // TODO:
    //      Make this property defined in JSON
    //      
    if (typeof isDefault === "undefined") {
      isDefault = true;
     } 
    if (isDefault && options.autoPlay === true) {
      flowplayerHelper().play(DOMelement);
     }
    else
     {
      flowplayerHelper().load(DOMelement);
     }
    
    transcript({
                DOMelement : DOMelement,
                file : file
               });
   }

  /**
   * Ensuring proper prefixing of images added by means other than bindData
   * (e.g., adding via html string: string.push('<img src="../resources/img/example.jpg' />')
   * @param selector
   * @param context
   */
  function fixImgPaths(context, selector)
   {
    selector = selector || 'img';
    context = context || 'body';
      // Check sources graphics and fix their src values
      $.each($(selector, context), function()
                                    {
                                     // In case this is called on templates that normally have graphics, but they are set to display none and have no src attribute
                                     if ($(this).attr('src') !== undefined)
                                      {
                                       // IE7 Fix
                                       if ($(this).attr('src').indexOf('http://') !== -1) {
                                         var tempArray = $(this).attr('src').split('/resources/'); 
                                         $(this).attr('src', app.baseURL + 'resources/' + tempArray[1]);
                                        } else if($(this).attr('src').indexOf('s3scorm') !== -1){
                                         $(this).attr('src', $(this).attr('src'));
                                        }
                                        else
                                        {
                                         $(this).attr('src', app.baseURL + $(this).attr('src'));
                                        }
                                      }
                                    });
   }
  function videoplayerHelper(){
    return {
      getVideoPlayers: function(){
        return videojs.getPlayers();
      },
      getVideoPlayer: function(playerId){
        return videojs.getPlayer(playerId);
      },
      nextVideoPlayerId: function(){
        return ++_currentVideoPlayerId;
      },
      currentVideoPlayerId: function(){
        return _currentVideoPlayerId;
      },
      initializePlayer: function(playerId, options, callback){
        options = options || {
          controls: true,
          autoplay: false,
          preload: 'auto'
        }
        videojs(playerId, options, callback)
      },
      play: function(playerId){
        myPlayer = videojs.getPlayer(playerId);
        myPlayer.ready(function(){
          myPlayer.play();
        })
      },
      pause: function(playerId){
        myPlayer = videojs.getPlayer(playerId);
        myPlayer.ready(function(){
          myPlayer.pause();
        })
      },
      setClip: function(playerId, clip, playClip){
        myPlayer = videojs.getPlayer(playerId);
        myPlayer.src(playerId);
        if(playClip){
          myPlayer.ready(function() {
            myPlayer.play();
          })
        }
      },
      getClip: function(playerId){
        myPlayer = videojs.getPlayer(playerId);
        return myPlayer.src();
      }
    }
  }
  /**
   * Keeps track of all flowplayers
   * Used by bindData to insert unique <a> flowplayers
   * @method flowplayerHelper
   * @return object
   */
  function flowplayerHelper()
   {
    return {      
      /**
       * Gets the next unique id. 
       * Basically returns 1 + the number of flowplayers in the DOM.
       * @return a unique id
       */
      getFlowplayers : function ()
                        {
                         return _flowplayers;
                        },
      nextFlowplayerId : function ()
                          {
                           return ++_currentFlowplayerId;
                          },
      close : function (DOMelement)
               {
                var id = _flowplayers[DOMelement];
                
                if (id !== undefined) {
                 $f(id).close();
                }
               },                          
      load : function (DOMelement)
              {
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                $f(id).load();
               }
              },                          
      play : function (DOMelement)
              {
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                 $f(id).play();
                }
              },
      getClip : function (DOMelement)
              {
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                return $f(id).getClip();
               }
              },
      setClip : function (DOMelement, clip)
              {
               // browse interview.js setVideo method to see an alternative to setClip...setClip doesn't work as expected
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                 $f(id).setClip(clip);
                }
              },
     setPlaylist : function (DOMelement, clip)
              {
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                $f(id).setPlaylist(clip);
               }
              },
      stop : function (DOMelement)
              {
               var id = _flowplayers[DOMelement];
               
               if (id !== undefined) {
                 $f(id).stop();
                }
              },
      unload : function (DOMelement)
                {
                 var id = _flowplayers[DOMelement];
                 
                 if (id !== undefined) {
                  $f(id).unload();
                 }
                }, 
         
      registerFlowplayer : function (args)
                            {
                             var DOMelement = args.DOMelement,
                                 player = args.playerId;
                             
                             _flowplayers[DOMelement] = player;
                             
                             // Added these while debugging vidNotesRemediation to make it more associative-array-ish. May be able to remove later.
                             _flowplayers.length++;
                             _flowplayers[_flowplayers.length] = {
                                                                  DOMelement : DOMelement,
                                                                  player : player
                                                                 };
                            }
     };
   }

  function getData()
   {
    return _data;
   }

  function getGlobalBase()
   {
//    var globalBase = app.getPackageData().packageData[0].globalBase || 'global';
    
    return _globalBase; 
   }
  
  function setGlobalBase(args)
  {
   if (args === undefined)
    {
     _globalBase = app.getPackageData().packageData[0].globalBase || 'global';
    }
   else
    {
     _globalBase = args;
    }
   
   return _globalBase;
  }

  function getGlobalQuestionBank()
   {
    return _globalQuestionBank;
   }

  function getTemplateName()
   {
    return getData().metadata[0].template;
   }

  function init(pageName)
   {
    loadData({
              url : pageName,
              appendTo : 'body'
             });
   }
  
  function isVideoSupported()
  {
   if (!!document.createElement("video").canPlayType)
    {
     var vidTest = document.createElement("video"),
         oggTest = vidTest.canPlayType("video/ogg; codecs=\"theora, vorbis\"");
         
     if (!oggTest)
      {
       h264Test = vidTest.canPlayType("video/mp4; codecs=\"avc1.42E01E, mp4a.40.2\"");
       
       if (!h264Test)
        {
         return false;
        }
       else
        {
         if (h264Test == "probably")
          {
           return true;
          }
         else
          {
           return false;
          }
        }
      }
     else
      {
       if (oggTest == "probably")
        {
         return true;
        }
       else
        {
         return false;
        }
      }
     
     return true;
    }
   else
    {
     return false;
    }
  }

  function loadAndRender()
   {
    var test = new TestManager({
                                link : app,
                                testData : {
                                            data : getData().questions
                                           },
                                testName : app.getPageName()
                               });
                               
    loadGlobals();
    app.setTest(test);
    app.getTest().render();
    
    bindLearnerName();
    $('body').trigger('runUnitTests');
   }

  function loadCSS(url)
   {
    var css,
        packageSkin = app.getPackageData().packageData[0].cssSkin;
    
    // Load template CSS
    if ($('#templateCSS').length < 1) {
      css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = app.baseURL + 'resources/templates/' + url + '/' + url + '.css';
      css.type = 'text/css';
      css.id = 'templateCSS';
      document.getElementsByTagName('head')[0].appendChild(css);
     }
    else {
      $('#templateCSS').attr({
                              href : app.baseURL + 'resources/templates/' + url + '/' + url + '.css'
                             });
     }
    
    // Support for unit test skins and global base in pages.json
    if (app.getPagesObject().pages[app.getCurrentPage()].branding !== undefined)
     {
      packageSkin = app.getPagesObject().pages[app.getCurrentPage()].branding.cssSkin;
      
      // Remove previous package level css since it will change page by page
      $('#packageCSS').remove();
     }
    
    // Load package CSS
    if (packageSkin && $('#packageCSS').length < 1) {
      if (typeof packageSkin === 'string')
       {
        css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = app.baseURL + 'resources/templates/' + getGlobalBase() + '/skins/' + packageSkin + '.css';
        css.type = 'text/css';
        css.id = 'packageCSS';
        document.getElementsByTagName('head')[0].appendChild(css);
       }
      else
       {
        // expecting object        
        $.each(packageSkin.skins, function(index, value)
                                   {
                                    var skin;
                                    
                                    skin = document.createElement('link');
                                    skin.rel = 'stylesheet';
                                    skin.href = app.baseURL + 'resources/templates/' + getGlobalBase() + '/skins/' + value.file;
                                    skin.type = 'text/css';
                                    skin.media = value.media;

                                    document.getElementsByTagName('head')[0].appendChild(skin);
                                   });
        
        // do base package css last
        css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = app.baseURL + 'resources/templates/' + getGlobalBase() + '/skins/' + packageSkin.base + '.css';
        css.type = 'text/css';
        css.id = 'packageCSS';
        css.media = packageSkin.media || 'screen';
        document.getElementsByTagName('head')[0].appendChild(css);
       }
     }
   }

  function loadData(args)
   {
    args = args || {};
    
    var url = args.url || '',
        appendTo = args.appendTo || 'body';
    
    $.ajax({
            url : '/s3scorm/ale/content/data/' + url + '.json',
            async : true,
            cache : false,
            dataType : 'json',
            success : function (data)
                       {
                        setData(data);
                        
                        var templateName = getTemplateName();
                        
                        setBodyClass({
                                      className : templateName,
                                      body : 'body'
                                     });
                        
                        buildPage({
                                   appendTo : appendTo,
                                   templateName : templateName
                                  });
                       },
            error : function (XMLHttpRequest, textStatus, errorThrown)
                     {
                      //console.info('ERROR => XMLHttpRequest:');
                      //console.debug(XMLHttpRequest);
                      //console.info('ERROR => textStatus:');
                      //console.debug(textStatus);
                      //console.info('ERROR => errorThrown:');
                      //console.debug(errorThrown);
                      return false;
                     }
           });
   }

  function loadGlobals()
   {
    showMasthead();
    showNavigation();
    showToolkit();
    applyGlobalNav();
   }

  function loadHTML(args)
   {
    args = args || {};
    
    var url = args.url || '',
        appendTo = args.appendTo || 'body';
    
    $.ajax({
            url : app.baseURL + 'resources/templates/' + url + '/' + url + '.html',
            dataType : 'html',
            async : true,
            success : function (data)
                       {
                        $(function () // Ensures (for IE) DOM is ready
                           {
                            if (appendTo === 'body') {
                              app.scorm.parent().frames.ScormContent.document.body.innerHTML = data;
                             }
                            else {
                              $(appendTo).append(data);
                             }
                            
                            loadJS({
                                    callback : loadAndRender,
                                    url : url
                                   });
                           });
                       },
            error : function (XMLHttpRequest, textStatus, errorThrown)
                     {
                      //console.info('ERROR => XMLHttpRequest:');
                      //console.debug(XMLHttpRequest);
                      //console.info('ERROR => textStatus:');
                      //console.debug(textStatus);
                      //console.info('ERROR => errorThrown:');
                      //console.debug(errorThrown);
                      return false;
                     }
           });
   }

  function loadJS(args)
   {
    args = args || {};

    var script,
        url = args.url || '',
        // Private helper callback function.
        // Ensure the callback function in arguments is called before we bind the data.
        callback = (function(_callback, _bindData, args)
                         {
                          return function() 
                                  {
                                   if(typeof _callback === 'function') 
                                    {
                                     _callback();
                                    }
                                   if(typeof _bindData === 'function') 
                                    {
                                     _bindData(args || {});
                                    }
                                  };
                         })(args.callback, bindData, {
                                                      source : getData().content[0]
                                                     });
    
    $('#templateJS').remove();
    
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'templateJS';
    
    if (script.readyState) 
     {
      script.onreadystatechange = function ()
                                   {
                                    if (script.readyState === "loaded" || script.readyState === "complete") 
                                     {
                                      script.onreadystatechange = null;
                                      callback();
                                      $('body').trigger('template.loaded');
                                     }
                                   };
     }
    else {
      script.onload = function ()
                       {
                        callback();
                        $('body').trigger('template.loaded');
                       };
     }
    
    script.src = app.baseURL + 'resources/templates/' + url + '/' + url + '.js';
    
    document.getElementsByTagName("head")[0].appendChild(script);
   }

  /**
   * Adds a class to the body with the name of the template.
   * Also, checks the template for a skin setting and sets that if present. 
   * @param {Object} className
   */
  function setBodyClass(args)
   {
    $(function()
       {
        var bodyClassName = args.className,
            skinClassName = app.template.getData().metadata[0].cssSkin;
        
        //$('body').addClass(className); // Doesn't work for some reason I forget
        $(args.body).attr({
                           'class' : [bodyClassName, skinClassName].join(' ')
                          });
       });
   }

  function setData(value)
   {
    _data = value;
   }

  function setGlobalQuestionBank(args)
   {
    var description = args.description,
        id = args.id,
        testID = args.testID,
        value = args.value;
    
    _globalQuestionBank[testID] = _globalQuestionBank[testID] || [];
    _globalQuestionBank[testID][id] = _globalQuestionBank[testID][id] || {};
    _globalQuestionBank[testID][id].learner_response = value;
    _globalQuestionBank[testID][description].description = description;
   }

  function showError(e)
   {
    e = e || {};
   }

  function showMasthead()
   {
    if ($('#masthead_container').length > 0) {
      $.ajax({
             url : app.baseURL + 'resources/templates/' + getGlobalBase() + '/masthead/global_masthead.html',
             dataType : 'html',
             async : false,
             success : function (data)
                        {
                         $('#masthead_container').html(data);
                         
                         // Masthead data loading moved to global template -> global_masthead js
                         // NOTE: found in global_en template
                         bindData({
                                   source : getData().metadata[0].masthead
                                  });
                         
                         if ($('#global_mastheadJS').length < 1) {
                           var js = document.createElement('script');
                           js.src = app.baseURL + 'resources/templates/' + getGlobalBase() + '/masthead/global_masthead.js';
                           js.id = 'global_mastheadJS';
                           document.getElementsByTagName('head')[0].appendChild(js);
                          }
                         else {
                           app.globalMasthead.render({
                                                      'currentPage' : app.getCurrentPage(),
                                                      'callback' : applyGlobalMasthead
                                                     });
                          }
                          
                        },
             error : function (data)
                      {
                       //console.info('******* FAILURE *******');
                       //console.debug(data);
                      }
            });
     }
   }

  function showNavigation()
   {
    var navigationContainer = $('#navigation_container');
    if(!navigationContainer.length)
     {
      navigationContainer = $('#nav_container');
     }
    if(navigationContainer.length > 0) {
      $.ajax({
              url : app.baseURL + 'resources/templates/' + getGlobalBase() + '/navigation/global_navigation.html',
              dataType : 'html',
              async : true,
              success : function (data)
                         {
                          navigationContainer.html(data);
                          
                          if ($('#global_navigationJS').length < 1) {
                            var js = document.createElement('script');
                            js.src = app.baseURL + 'resources/templates/' + getGlobalBase() + '/navigation/global_navigation.js';
                            js.id = 'global_navigationJS';
                            document.getElementsByTagName('head')[0].appendChild(js);
                           }
                          else if (app.globalMasthead && app.globalNavigation) {
                            app.globalNavigation.render({
                                                         currentPage : app.getCurrentPage(), 
                                                         callback : app.template.applyGlobalNav
                                                        });
                           }
                         },
              error : function (data)
                       {
                        //console.info('******* FAILURE *******');
                        //console.debug(data);
                       }
             });
     }
   }

  function showToolkit()
   {
    app.toolkit.init();
   }
  
  function _loadJS(args)
   {
    var appendTo = args.appendTo,
        script;
    if(appendTo)
     {
      script = $('#' + appendTo);
      if(!script.length)
       {
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = appendTo;
        script.src = args.url;
        if (script.readyState) 
         {
          script.onreadystatechange = function ()
                                       {
                                        if (script.readyState === "loaded" || script.readyState === "complete") 
                                         {
                                          script.onreadystatechange = null;
                                          args.callback && args.callback();
                                         }
                                       };
        }
       else 
        {
         script.onload = function ()
                          {
                           args.callback && args.callback();
                          };
        }
       document.getElementsByTagName("head")[0].appendChild(script);  
      }
     else
      {
       args.callback && args.callback();
      }
    }
  }
  /**
   * this function is used for showing notepad 
   * ex. app.template.showNotepad('SP_SC05a_02_vidNotesRemediation')
   *     if no testId provided, show the current page by default.
   * @param testId
   */
  function showNotepad(/*string*/testId)
   {
    _loadJS({
     callback : function()
                 {
                  !app.notepad && app.loadResource('notepad', new Notepad(app));
                  app.notepad.show(testId);
                 },
     appendTo: 'notePadJS',
     url : app.baseURL + 'resources/js/lib/notepad/js/Notepad.js'
    });
   }
  
  function transcript(args)
   {
    var appendLinkTo = args.appendLinkTo || '#data_videoURL',
        DOMelement = args.DOMelement,
        file = args.file,
        title = args.title || $('#data_header').text();

    if ($('#lightbox_toolkit_lb').length > 0)
     {
      return;
     }
    
    // Check if a transcript exists for this video
    //regex to remove file extension then then look for file with that name to load
    $.ajax({
            url: '/s3scorm/ale/content/assets/' + file.replace(/\.[0-9a-z]+$/i, '.txt'),
            cache: false,
            dataType: 'txt',
            success: function(txt)
                      {
                       $(document.createElement('a')).addClass('transcript')
                                                     .bind('click', function()
                                                                     {
                                                                      app.lightbox.render({
                                                                                           'global' : app,
                                                                                           'id' : 'transcript',
                                                                                           'data' : {
                                                                                                     'type' : 'default',
                                                                                                     'content' : {
                                                                                                                  'title' : title + ' Transcript',
                                                                                                                  'html' : txt
                                                                                                                 }
                                                                                                    },
                                                                                           'callback' : function ()
                                                                                                         {
                                                                                                          $('#lightbox_transcript').width($('a.flowplayer').width() + 3);
                                                                                                          $('a.transcript').hide();
                                                                                                          
                                                                                                          $('body').one('lightbox.closed', function()
                                                                                                                                            {
                                                                                                                                             $('a.transcript').show();
                                                                                                                                            });
                                                                                                         },
                                                                                           'modal' : false,
                                                                                           'position' : {
                                                                                                         'type' : 'relative',
                                                                                                         'x' : $(DOMelement).offset().left + 293,
                                                                                                         'y' : $(DOMelement).offset().top + $(DOMelement).height()
                                                                                                        }
                                                                                          });
                                                                     })
                                                     .text('View Transcript')
                                                     .attr('href', '#')
                                                     .appendTo($('#lightbox_toolkit_lb').length > 0 ? $('#lightbox_data_videoURL').length > 0 ? '#lightbox_data_videoURL' : '#lightbox_toolkit_lb ' + appendLinkTo : appendLinkTo);
                      }
          });
   }
  
  function Widget(args)
   {
    args = args || {};
    
    var element = args.element || '#main_container',
        script,
        template = args.template,
        config = args.config;
    
    script = app.baseURL + 'resources/js/lib/widgets/' + template + '/' + template + '.js';
    
    $.getScript(script, function()
                         {
                          $.widget('ui.' + template, app.template.Widget.data);
                          return $(element)[template]();
                         });
   }

  
  // Public interface
  // ----------------
  this.applyGlobalMasthead = applyGlobalMasthead;
  this.applyGlobalNav = applyGlobalNav;
  this.bindData = bindData;
  this.fixImgPaths = fixImgPaths;
  this.flowplayerHelper = flowplayerHelper;
  this.getData = getData;
  this.getGlobalQuestionBank = getGlobalQuestionBank;
  this.getTemplateName = getTemplateName;
  this.init = init; 
  this.loadCSS = loadCSS;
  this.loadGlobals = loadGlobals;
  this.loadHTML = loadHTML;
  this.setData = setData;
  this.setGlobalQuestionBank = setGlobalQuestionBank;
  this.showNotepad = showNotepad;
  this.transcript = transcript;
  this.Widget = Widget;
  this.videoplayerHelper = videoplayerHelper;
 }