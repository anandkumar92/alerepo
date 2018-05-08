/**
 * Carousel template class
 * @param app
 * @returns {Carousel}
 */
function Carousel(app)
 {
  // Private vars
  // ------------
  
  setConfig();
  
  function init()
   {
    slideFactory();
    
    // Create/append next/prev buttons
    buildControls();
    
    
    setButtonsState({
                     next : {
                             enabled : true 
                            },
                     previous : {
                                 enabled : false
                                }
                    });
    
    manageControls();    
    
    app.template.fixImgPaths();
   }
  
  function buildControls()
   {
    var next = $(document.createElement('div')),
        prev;
    
    next.addClass('controls');
    
    prev = next.clone();
    
    next.addClass('next');
    prev.addClass('prev');
    
    $('div#scroller_content_container').prepend(prev)
                                       .append(next);
    
    $('div.controls').bind('click', function()
                                    {
                                     var direction = $(this).index('div.controls');
                                     
                                     if (direction === 0)
                                      {
                                       scrollSlides('previous');
                                      }
                                     else
                                      {
                                       scrollSlides('next');
                                      }
                                    });
    
    $('div.controls.prev, div.controls.next').append('<a class="niftyFix"></a>');
    
    Nifty('div.prev', 'left');
    Nifty('div.next', 'right');
   }
  
  function getConfig()
   {
    return undefined;
   }
  
  function getButtonsState()
   {
    return undefined;
   }
  
  function manageControls()
   {
    var slidesCount = $('div#carousel_container li').length,
        disabledSlides = $('div#carousel_container li:hidden').length,
        activeSlides = slidesCount - disabledSlides;

    if (disabledSlides === 0)
     {
      setButtonsState({
                       next : {
                               enabled : true
                              },
                       previous : {
                                   enabled : false
                                  }
                      });
     }
    
    if (slidesCount <= 3)
     {
      setButtonsState({
                       next : {
                               enabled : false
                              },
                       previous : {
                                   enabled : false
                                  }
                      });
      return;
     }
    
    if (disabledSlides > 0)
     {
      setButtonsState({
                       next : {
                               enabled : true
                              },
                       previous : {
                                   enabled : true
                                  }
                      });
     }
    
    if (activeSlides < 3)
     {
      setButtonsState({
                       next : {
                               enabled : false
                              },
                       previous : {
                                   enabled : true
                                  }
                      });
     }
   }
  
  function setButtonsState(args)
   {
    if (args.next.enabled === false)
     {
      $('div.controls.next').addClass('inactive');
     }
    
    if (args.next.enabled === true)
     {
      $('div.controls.next').removeClass('inactive');
     }
    
    if (args.previous.enabled === false)
     {
      $('div.controls.prev').addClass('inactive');
     }
    
    if (args.previous.enabled === true)
     {
      $('div.controls.prev').removeClass('inactive');
     }

    
    getButtonsState = function()
                       {
                        return $.extend({
                                         next : {
                                                 enabled : true 
                                                },
                                         previous : {
                                                     enabled : false
                                                    }
                                        }, args);
                       }
   }
  
  function setConfig(args)
   {
    getConfig = function()
                 {
                  return $.extend({
                                   currentSlide : 0
                                  }, args);
                 }
   }
  
  function scrollSlides(direction)
   {
    var currentSlide = $('div#carousel_container li:not(:hidden)').index('div#carousel_container li');

    if (direction === 'next' && getButtonsState().next.enabled === true)
     {
      $('#carousel_container li:eq(' + currentSlide + ')').animate({
                                                                       width : 0,
                                                                       'marginLeft' : '-=' + $('div#carousel_container ul li:eq(' + currentSlide + ') img').width() + 20
                                                                      }, 500, function()
                                                                               {
                                                                                $(this).hide();
                                                                                manageControls();
                                                                               });
     }

    if (direction === 'previous' && getButtonsState().previous.enabled === true)
     {
      $('div#carousel_container ul li:eq(' + (currentSlide - 1) + ')').show()
                                                                      .animate({
                                                                                width : $('div#carousel_container ul li:eq(' + currentSlide + ') img').width() + 20,
                                                                                'marginLeft' : '+=' + $('div#carousel_container ul li:eq(' + currentSlide + ') img').width() + 20
                                                                               }, 200, function()
                                                                                        {
                                                                                         $(this).removeAttr('style');
                                                                                         manageControls();
                                                                                        });
     }
   }
  
  function slideFactory(args)
   {
    var args = args || {},
        slideData = args.slideData || app.template.getData().content[0].slideShows
        ul = $(document.createElement('ul'));
    
    $.each(slideData, function(i, value)
                       {
                        var li = $(document.createElement('li')),
                            par = $(document.createElement('p')),
                            header = $(document.createElement('h3')),
                            headerText = slideData[i].slide || '&nbsp;',
                            div = $(document.createElement('div')),
                            divContainer = $(document.createElement('div')),
                            img = $(document.createElement('img')),
                            imgLength = slideData[i].images.length;
                                           
                        for (var x = 0; x < imgLength; x++)
                         {
                          divContainer.addClass('frame')
                                      .appendTo(li);
                          
                          par.html(headerText)
                             .appendTo(divContainer);
                          
                          div.addClass('data_slide');
                          
                          img.attr('src', '/s3scorm/ale/content/assets/' + slideData[i].images[0])
                             .appendTo(div);
                          
                          div.appendTo(divContainer);
                          
                          li.append(divContainer)
                            .appendTo(ul);
                         }
                       });
    
    // Append documentFragment
    ul.appendTo('div#carousel_container');
    
    // IE sets height/width attributes so lets remove them
    $('li img').removeAttr('height')
               .removeAttr('width');
   }
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new Carousel(ale);