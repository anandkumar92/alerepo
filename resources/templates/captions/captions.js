/**
 * Captions template constructor function
 * @param args
 * @return
 */

function Captions(args)
 {
  var _config = {};
  setConfig(args);
  
  var app = getConfig().link,
      console = new Console(),
      
      // Get slide data from json
      slideShows = app.template.getData().content[0].slideShows;
  
  this.render = render;
  
  init();

  /**
   * Returns app.template.getData().content[0].answerList
   * @return object
   */
  function answerList()
   {
    return app.template.getData().content[0].answerList;
   }
  
  function bindLinks(args)
   {
    $('.jcarousel-next').unbind()
                        .click(function ()
                                {
                                 $('a.save_caption').each(function()
                                                           {
                                                            $(this).trigger('click');
                                                           });
                                 
                                 scrollSlideShow({
                                                  direction : 'next'
                                                 });
                                });
    
    $('.jcarousel-prev').unbind()
                        .click(function ()
                                   {
                                    $('a.save_caption').each(function()
                                                              {
                                                               $(this).trigger('click');
                                                              });
                                    
                                    scrollSlideShow({
                                                     direction : 'prev'
                                                    });
                                   });

    $('a.edit_caption_link').unbind('click.edit')
                            .bind('click.edit', function()
                                                 {
                                                  var id = $(this).parents().find('.frame p').html(),
                                                      caption = $(this).closest('li').find('.caption_area'),
                                                      contents = [caption.html()];
                                                  
                                                  //hide current text that may exist, in case user wishes to cancel the edit
                                                  caption.css('font-size','0px');
                                                  caption.css('color','#E5E5E5');
             
                                                  contents.push('<textarea>',
                                                                   contents[0],
                                                                '</textarea>');
                                                  
                                                  caption.html(contents.join(''));
                                                  
                                                  // Build-buttons-function call, feed it the (location/scope) for the buttons
                                                  buildCaptionControls({
                                                                        selector : $(this).closest('li')
                                                                       });
                                                  
                                                  ieFixButtons();
                                                  
                                                  return false;
                                                                  });
   }
  
  function buildCaptionControls(args)
   {
    var caption = args.selector.find('.caption_area textarea'),
        captionHolder = args.selector.find('.caption_area'),
        cancelBtn = document.createElement('a'),
        id = args.selector.find('.frame p').html(),
        leftLocation = $('ul#mycarousel').css('left'),
        saveBtn = document.createElement('a'),
        buttonHolder = args.selector.find('.edit_caption');
    
    $(captionHolder).removeClass('answered');
    
    $(cancelBtn).html('cancel');
    $(cancelBtn).attr('href', '');
    $(cancelBtn).attr('class', 'button cancel_edit');
    
    $(buttonHolder).html(cancelBtn);
     
    $(saveBtn).html('save caption');
    $(saveBtn).attr('href', '');
    $(saveBtn).attr('class', 'button save_caption');
    
    $(buttonHolder).append(saveBtn);

    $('body').bind('palette.hidden', function()
                                      {
                                       ieFixButtons();
                                      });
    
    $('body').bind('palette.shown', function()
                                      {
                                       ieFixButtons();
                                      })
    
    $('textarea').palette({
                           'containment' : '.jcarousel-container',
                           'language' : 'spanish'
                          });
    
    
    // Corrects the IE8 behavior of scrolling to an incorrect line
//    $('textarea').focus(function()
//                         {
//                          $(this).scrollTop($(this)[0].scrollHeight - $(this).height());
//                         });
    
    //  Create click events for buttons
    $('a.save_caption').click(function (e)
                               {
                                var id = $(this).parent('div').parent('li').index('li.jcarousel-item'),
                                    specCaptionHolder = $('li.jcarousel-item:eq(' + id + ')').find('.caption_area'),
                                    specButtonHolder = $('li.jcarousel-item:eq(' + id + ')').find('.edit_caption');
                                
                                //changes done to resolve an IE data persistance bug
                                var captionText = $(this).parent().parent().find('.caption_area textarea').val();

                                if (captionText === undefined || captionText.replace(/\s+/g, '').length === 0)
                                 {
                                  return;
                                 }
                                
                                specCaptionHolder.html(captionText);
//                                captionHolder.css('word-wrap','break-word');
                                specButtonHolder.html('<a href="#" class="edit_caption_link">editar</a>');
                                
                                // Reset text size/color to show new value
                                specCaptionHolder.css('font-size','10pt');
                                specCaptionHolder.css('color','#000000');

                                bindLinks();
                                
                                // Enable submit if any text was entered
                                if (captionText.length > 0)
                                 {
                                  $('input#submit').removeAttr('disabled')
                                                   .removeClass('disableds');
                                  
                                  $(specCaptionHolder).addClass('answered');
                                 }
                                else
                                 {
                                  $(specCaptionHolder).removeClass('answered');
                                 }
                                
                                // Record interaction data                                
                                app.getTest().recordInteraction({
                                                                 id : args.selector.index(),
                                                                 value : captionText
                                                                });
                                return false;
                               });

    $('a.cancel_edit').click(function ()
                              {
                               // Reset text size/color to show new value
                               captionHolder.css('font-size','10pt');
                               captionHolder.css('color','#000000');
                               caption.remove();
                               buttonHolder.html('<a href="#" class="edit_caption_link">editar</a>');
                               
                               bindLinks();
                               return false;
                              });
   }
  
  function buildCarousel()
   {
    // Overwriting next and prev functions to hijack controls
    // jcarousel default scrolling is per li elements but custom widths for groups throws it off
    // Added pos because of errors showing up in ie7
    $.jcarousel.prototype.next = function ()
                                  {
                                   return;
                                  };
                                  
    $.jcarousel.prototype.pos = function ()
                                 {
                                  return 1;
                                 };
    
    $.jcarousel.prototype.prev = function ()
                                  {
                                   return;
                                  };
    
    // Add jcarousel internal elements
    $('ul#mycarousel').jcarousel();
    
    // Calculate combined <li> widths
    var calculatedWidths = (function ()
                            {
                             var totalWidths = 0;
                             
                             $('ul#mycarousel li').each(function (index)
                                                         {
                                                          totalWidths = totalWidths + parseInt($(this).css('width').split('px')[0]) + 30;
                                                         });
                             
                             // If the display width is less than needed to scroll
                             // Scroll buttons will be removed
                             totalWidths <= 800
                                               ? $('div.jcarousel-prev-horizontal, div.jcarousel-next-horizontal').hide()
                                               : null;
                             
                             return totalWidths;
                            })();
                           
    // Set <ul> width
    $('ul#mycarousel').width(calculatedWidths);
   }
  
  /**
   * Build DOM structure for slideshows and
   * then append it to the DOM 
   * @param args
   */
  function buildSlideShow(args)
   {
    var elementCount = 0,
        
        // Used to add the slide (header) text value from the json data to the group <li>
        header = '',
        
//        itemsCount = args.itemsCount
        
        // Used to add a class to the last element of a group
        injector = '',
        
        // Max width for carousel ul
        maxWidth = 0,
        slideShowsLength = slideShows.length;
    
    // If we aren't receiving any data, create a dummy object    
    args = args || {};
    args.correctAnswers = args.correctAnswers || {};
    
    // Loop through the images in each slide
    
    for (var x = 0; x < slideShowsLength; x++)
     {
      var imagesLength = slideShows[x].images.length;
      
      /**
       * Create the following structure for each element of each group:
       * <li class="...">
       *   <div class="frame">
       *     <h3>{header}</h3>
       *     <div class="data_slide">
       *       <img src="{image url}">
       *     </div>
       *     <div class="caption_area">
       *     </div>
       *   </div>
       * </li>
       */
      for (var y = 0; y < imagesLength; y++)
       {
        // Restrict header to getting shown only once per group
        header = (elementCount === 0)
                  ? header = slideShows[x].slide || '&nbsp;'
                  : '&nbsp;';
         
        // If we are at the last item of the group, add a divider class
        injector = (elementCount === (imagesLength - 1)) 
                    ? 'injector' 
                    : '';
        // Build html <li> wrappers for each div
        // Wait to append to #mycarousel until the end
        var liContainer = document.createElement('li');
        liContainer.className = ['jcarousel-item ',
                                 'jcarousel-item-horizontal ',
                                 'jcarousel-item-', (elementCount + 1), '-horizontal ',
                                 injector].join('');
        liContainer.setAttribute('jcarouselindex', (elementCount + 1));
        
        
        // Create frame <div> and append to <li>
        var divContainer = document.createElement('div');
        $(divContainer).addClass('frame');
        liContainer.appendChild(divContainer);

        // Create header <p> element and append to frame <div>
        var headerContainer = document.createElement('p');
        headerContainer.innerHTML = header;
        divContainer.appendChild(headerContainer);
        
        // Create data_slide <div> element and append to frame <div>
        var newDiv = document.createElement('div');
        $(newDiv).addClass('data_slide');
        divContainer.appendChild(newDiv);
        
        // Create caption_area <div> element and append to parent li
        var caption_area = document.createElement('div');
        $(caption_area).addClass('caption_area');
 
        // Hooking into the function to check/add interactions
        if (args.correctAnswers[x] !== undefined)
         {            
          caption_area.innerHTML = args.correctAnswers[x].answer;
          
          $('input#submit').removeAttr('disabled')
                           .removeClass('disableds');
          
          $(caption_area).addClass('answered');
         }
        
        liContainer.appendChild(caption_area);
        
        // Create "edit caption" holder and append to parent li
        var editCaptionDiv = document.createElement('div');
        $(editCaptionDiv).addClass('edit_caption');
        editCaptionDiv.innerHTML = '<a href="#" class="edit_caption_link">editar</a>';
        liContainer.appendChild(editCaptionDiv);
        
        // Create slide <img> and append to newdiv <div>
        var imageWidth,
            newImage = document.createElement('img');
        newImage.src = '/s3scorm/ale/content/assets/' + slideShows[x].images[y];
        $(newImage).addClass('data_slide');
        newDiv.appendChild(newImage);
        
        // Get width of current image, have to check two ways because of IE
        imageWidth = newImage.width || 266;
        
        // Append everything to #mycarousel
        var mycarousel = document.getElementById('mycarousel');
        mycarousel.appendChild(liContainer);
 
        liContainer.style.width = '320px';

        // Calculate widths, add 30 pixels for padding             
        maxWidth = maxWidth + (parseInt(liContainer.style.width)+30);
        
        // If we're at the end of this group's items increment elementCount, otherwise ... ?
        if (elementCount === (imagesLength - 1))
         {
          elementCount = 0;
          injector = '';
         }
        else
         {
          elementCount++;
         }
       }
     }

    setConfig({
               maxPosition : (maxWidth - 875)
              });
              
    buildCarousel();
   }
  
  function buildSubmitButton()
   {
    // Create elements
    var submitButton = document.createElement('input');
    submitButton.id = 'submit';
    submitButton.className = 'disableds';
    submitButton.setAttribute('disabled', '');
    submitButton.setAttribute('type', 'button');
    
    // Insert element
    $('div#button_content').html(submitButton);
    
    // Bind submit event to it
    $(submitButton).bind('click', function (e)
                                   {
                                    if (!$(submitButton).hasClass('disableds'))
                                     {
                                      app.getTest().recordTest({
                                                                'score' : 0 // indicates completion - instructor will manually grade later 
                                                               });
                                      app.doNext();
                                      e.stopPropagation();
                                     }
                                   });
   }
  
  function checkButtonState(args)
   {
    var args = args || {},
        next = $('.jcarousel-next'),
        maxPosition = args.maxPosition || false,
        prev = $('.jcarousel-prev');
    
    if(getConfig().currentSlide === 0)
     {
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      prev.addClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      prev.attr('disabled','true');
      next.removeAttr('disabled');
     }
    
    if(getConfig().currentSlide > 0)
     {
      next.removeAttr('disabled');
      prev.removeAttr('disabled');
      prev.removeClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
     }
    
    if(maxPosition === true)
     {
      next.addClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      next.attr('disabled','true');
     }
   }

  function getConfig()
   {
    return _config;
   }
  
  function ieFixButtons()
   {
    setTimeout(function()
                {
                 if (($('li.jcarousel-item').length - getConfig().currentSlide) < 3)
                  {
                   checkButtonState({
                                     maxPosition : true
                                    });
                  }
                 else
                  {
                   checkButtonState();
                  }
                }, 400);
   }
  
  function init()
   {
    console.info('@MultiWebPage.init()');
    
    app.hooks.clearHooks();
    app.hooks.setHook({
                       'name' : 'RenderTest',
                       'functionName' : function ()
                                         {
                                          app.thisTemplate.render();
                                         }
                      });
   }
  
  /**
   * TODO: Update this description
   * @return
   */
  function questionsManager()
   {
    // Get the current TestManager instance
    var answers = app.getTest().getQuestionBank(),
        answersLength = answers.length;
        
        // TODO: Update this description
        incorrectAnswers = [],
        
        // TODO: Update this description
        correctAnswers = [];

    // Check if interaction data exists
    for (var x = 0; x < answersLength; x++)
     {
      // Build in/correct answer lists to pass
      // Since the questions are manually graded,
      // just push everything to the correct list
      if (answers[x].learner_response !== undefined)
       {
        correctAnswers[x] = {
                                         "answer" : answers[x].learner_response,
                                         "index" : answers[x].id
                                        };
       }
     }
    
    if (correctAnswers.length > 0)
     {
      //Build responses
      buildSlideShow({
                      "correctAnswers" : correctAnswers
                     });        
     }
    else
     {
      buildSlideShow();
     }
   }
  
  function render()
   {
    app.setUpLocalData(['captions']);
    buildSubmitButton();
    
    // Use questionsManager to 
    // Build scroller & slideshow internals
    questionsManager();
    
    // Bind links
    bindLinks();
    
    // Fix similar to clearfix but for Nifty corners
    $('div.jcarousel-prev, div.jcarousel-next').append('<a class="niftyFix"></a>')
    
    Nifty('div.jcarousel-prev-horizontal','left');
    Nifty('div.jcarousel-next-horizontal','right');
    Nifty('div.jcarousel-container');
    
    app.template.fixImgPaths('div.data_slide');
    
    // Set next button defaulted as enabled
    $('div.jcarousel-next').removeClass('jcarousel-next-disabled')
                           .removeClass('jcarousel-next-disabled-horizontal');
   }
  
  function scrollSlideShow(args)
   {
    var carousel = $('ul#mycarousel'),
        currentSlide = getConfig().currentSlide,
        value;
    
    if (currentSlide === undefined)
     {
      currentSlide = (function()
                       {
                        setConfig({
                                   currentSlide : 0
                                  });
                        
                        return 0;
                       }());
     }

    if (args.direction === 'next')
     {
      if (($('li.jcarousel-item').length - currentSlide) < 3)
       {
        checkButtonState({
                          maxPosition : true
                         });
        
        return;
       }
     
      $('li.jcarousel-item:eq(' + currentSlide + ')').animate({
                                                               width : 0,
                                                               'marginLeft' : '-=500'
                                                              }, 500, function()
                                                                       {
                                                                        $(this).hide();
                                                                       });
      setConfig({
                 currentSlide : currentSlide + 1
                });
      
      if (($('li.jcarousel-item').length - currentSlide) < 4)
       {
        checkButtonState({
                          maxPosition : true
                         });
        
        return;
       }
     }
    else
     {
      $('li.jcarousel-item:eq(' + (currentSlide - 1) + ')').show()
                                                           .animate({
                                                                     width : '320px',
                                                                     'marginLeft' : '+=500'
                                                                    }, 500);
       
      setConfig({
                 currentSlide : currentSlide - 1
                });
     }
    
    checkButtonState();
   }
  
  function setConfig(args)
   {
    _config = $.extend({
                        link : this
                       }, args);
   }
 }
 
App.prototype.thisTemplate = new Captions({
                                           'link' : ale
                                          });