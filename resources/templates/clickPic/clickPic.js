/**
 * ClickPic template class
 * @description This template is deprecated.  clickPicStatic should be used unless this template is being used for Spanish packages.
 * @param app
 * @returns {ClickPic}
 */
function ClickPic(app)
 {
  // Private methods
  // ---------------
  /**
   * Calls insertLinks() and then rounds 'div#clickPic_container' corners
   */
  function init()
   {
    app.hooks.clearHooks(); // Required to prevent previously loaded tests from firing
    
    if ($('#lightbox_toolkit_lb.clickPic.no_toolkit').length <= 0)
     {
      insertLinks();
     }
    
    $('#lightbox_toolkit_lb #clickPic_container .sprite.clickPic').die().live('click', function()
                                                             {
                                                              if($('#lightbox_toolkit_lb #clickPic_container img#imagePlayer').length)
                                                               {
                                                                $('#lightbox_toolkit_lb #clickPic_container img#imagePlayer').attr('src', '/s3scorm/ale/content/assets/' + $(this).attr('src'));
                                                               }
                                                              else 
                                                               {
                                                                $('#lightbox_toolkit_lb #clickPic_container').append('<img id="imagePlayer" src="/s3scorm/ale/content/assets/' + $(this).attr('src') + '"/>');  
                                                               }
                                                                  
                                                             });
    
    Nifty('div#clickPic_container', 'big');
   }

  /**
   * Iterates over 'lightboxes' JSON node and creates a link for each.
   * Then binds a function to each click event that renders a lightbox
   */
  function insertLinks()
   {
    var targetElement = document.createElement('div'),
        clickElement,
        coords,
        coordsLength,
        doPulse = false;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      coords = app.toolkit.getData().lightboxes;
      coordsLength = app.toolkit.getData().lightboxes.length;
     }
    else
     {
      coords = app.template.getData().lightboxes;
      coordsLength = app.template.getData().lightboxes.length;
     }
    
    doPulse = typeof coords[0].doPulse === 'undefined' || coords[0].doPulse;
    
    var i;
    for (i = 0; i < coordsLength; i++) {
      (function() // Closure required to reach the proper 'i'
        {
         var x = (function ()
                  {
                   return i;
                  }());
         
         clickElement = targetElement.cloneNode(true);
         clickElement.className = 'sprite clickPic';
         
         // Check if custom hotspot graphic exists
         if (coords[x].hotSpot !== undefined)
          {
           $(clickElement).css('background-image', 'url(/s3scorm/ale/content/assets/' + coords[x].hotSpot + ')');
          }
         
         if(doPulse)
          {
           $(clickElement).pulse(); 
          }
         $(clickElement).appendTo('#data_clickPic_content')
                        .bind('click', function ()
                                        {
                                         app.lightbox.render({
                                                              global : app,
                                                              id : x,
                                                              data : {
                                                                      type : coords[x].type || 'clickPic',
                                                                      content : {
                                                                                 title : coords[x].title,
                                                                                 header : coords[x].header,
                                                                                 audio : coords[x].audio,
                                                                                 definition : coords[x].definition,
                                                                                 imageCaptionURL : coords[x].imageCaptionURL,
                                                                                 imageCaption : coords[x].imageCaption
                                                                                }
                                                                     },
                                                              buildNewCallback : function ()
                                                                                  {
                                                                                   if(coords[x].audio)
                                                                                    {
                                                                                     var json = {};
                                                                                       
                                                                                     json['audio_' + x] = {
                                                                                                           type : 'audio',
                                                                                                           content : coords[x].audio.content
                                                                                                          };
                                                                                     app.template.bindData({
                                                                                                            source : json
                                                                                                           });  
                                                                                    }
                                                                                  },
                                                              callback : function ()
                                                                          {
                                                                           app.template.flowplayerHelper().play('#data_audio_' + x + ' a.flowplayer');
                                                                           
                                                                           $('body').bind('lightbox.closed', function()
                                                                                                              {
                                                                                                               app.template.flowplayerHelper().stop('#data_audio_' + x + ' a.flowplayer');
                                                                                                               return false;
                                                                                                              });
                                                                          }
                                                             });
                                        });
          
         $(clickElement).css({
                              top : coords[i].x + 'px',
                              left : coords[i].y + 'px'
                             });
         if(coords[i].src)
          {
           $(clickElement).attr('src', coords[i].src);  
          }
        }());
     }
   }

  
  // One-time setup
  // --------------
  init();
 }

App.prototype.thisTemplate = new ClickPic(ale);