/**
 * Sources template constructor function
 * @param args
 * @return
 */

function Sources(args)
 {
  var _config = {};
  setConfig(args);
  
  var app = getConfig().link,
      console = new Console(),
      
      contents,
      lastPage,
      parent = '.sources',
      slideShows;

//Guide list
//   (app.toolkit.getData() === undefined || app.toolkit.getData().content[0].contents === undefined)
//   ? (contents = app.template.getData().content[0].contents)
//   :contents = app.toolkit.getData().content[0].contents;
   
//Guide list
   if (app.toolkit.getData() === undefined || app.toolkit.getData().content[0].contents === undefined){
	   contents = app.template.getData().content[0].contents;
	   parent = '.sources';
    }
   else{
	   contents = app.toolkit.getData().content[0].contents;
	   parent = '#lightbox_toolkit_lb';
   }   
// Slide data from json
//   (app.toolkit.getData() === undefined || app.toolkit.getData().content[0].slideShows === undefined)
//   ? slideShows = app.template.getData().content[0].slideShows   
//   : slideShows = app.toolkit.getData().content[0].slideShows;
  
// Slide data from json
   if (app.toolkit.getData() === undefined || app.toolkit.getData().content[0].slideShows === undefined){
	   slideShows = app.template.getData().content[0].slideShows
	   parent = '.sources';
   }
   else{
	   slideShows = app.toolkit.getData().content[0].slideShows;
	   parent = '#lightbox_toolkit_lb';
   }
	   
   init();

  App.prototype.toolkitInit = function ()
  {
   getData = function()
              {
               return app.toolkit.getData();
              };
   Nifty('div#clickPic_container', 'big');
  };
  
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
    $('.jcarousel-next', parent).click(function ()
                                {
                                 scrollSlideShow({
                                                  direction : 'next'
                                                 });
                                });
    
    $('.jcarousel-prev', parent).click(function ()
                                {
                                 scrollSlideShow({
                                                  direction : 'prev'
                                                 });
                                });
   }
  
  function buildCaptionControls(args)
   {
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
                                  //this is the initial 'left' position of the carousel
                                  return 0;
                                 };
    
    $.jcarousel.prototype.prev = function ()
                                  {
                                   return;
                                  };
    
    // Add jcarousel internal elements
    $('ul#mycarousel',parent).jcarousel();
    
    // Calculate combined <li> widths
    var calculatedWidths = (function ()
                             {
                              var totalWidths = 0;
                              
                              $('ul#mycarousel li',parent).each(function (index)
                                                          {
                                                           totalWidths = totalWidths + parseInt($(this).css('width').split('px')[0]) + 30;
                                                          });
                              
                              // If the display width is less than needed to scroll
                              // Scroll buttons will be removed
                              totalWidths <= 800
                               ? $('div.jcarousel-prev-horizontal, div.jcarousel-next-horizontal',parent).hide()
                               : null;
                              
                              return totalWidths;
                             })();
                           
    // Set <ul> width
    $('ul#mycarousel',parent).width(calculatedWidths);
   }
  
  /**
   * Displays sources content list
   */
  function buildGuide()
   {
    var contentLength = contents.length,
        ulContainer = document.createElement('ul'),
        ulContainer = $(ulContainer);
    
    for (var x = 0; x < contentLength; x++)
     {
      var liContainer = document.createElement('li'),
          liContainer = $(liContainer),
          pageNumber = contents[x].pageNumber,
          title = contents[x].title;

      // Build each link
      liContainer.html('<a href="#" class="guideLink active" rel="' + pageNumber + '">' + title + '</a>');
      
      // Apply binding
      liContainer.bind('click', function()
                                 {
                                  scrollSlideShow({
                                                   direction : 'next',
                                                   times : $(this).find('a').attr('rel')
                                                  });
                                  //return false;
                                 });
      liContainer.appendTo(ulContainer);            
     }
    ulContainer.appendTo('#contents');
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
        
        // Create data_slide <div> element and append to frame <div>
        var newDiv = document.createElement('div');
        $(newDiv).addClass('data_slide');
//        divContainer.appendChild(newDiv);
        
        // Create slide <img> and append to newdiv <div>
        var newImage = document.createElement('img');
        newImage.src = '/s3scorm/ale/content/assets/' + slideShows[x].image;
        $(newImage).addClass('data_slide');
//        newDiv.appendChild(newImage);
        
        // Create div for JSON text
        var textDiv = document.createElement('div');
        $(textDiv).addClass('json_text');
        $(textDiv).html(slideShows[x].text)
        divContainer.appendChild(textDiv);

        // Create header <p> element and append to frame <div>
        var headerContainer = document.createElement('p');
        $(headerContainer).addClass('footer');
        $(headerContainer).html(slideShows[x].slide);
        $(divContainer).append(headerContainer);
        
        // Get width of current image, have to check two ways because of IE
        imageWidth = parseInt($(newImage).css('width')) || newImage.width;        
        
        // Assign custom width to caption_area & editCaptionDiv, adding 10 pixels for borders
        $('div.frame').css('width','100%');
        
        // Append everything to #mycarousel
        var mycarousel = document.getElementById('mycarousel');
        mycarousel.appendChild(liContainer);
        
        // Set needed fixed width before jcarousel runs
        liContainer.style.width = '620px'; 
                                  
        // Calculate widths, add 30 pixels for padding             
        maxWidth = maxWidth + (parseInt(liContainer.style.width)+30);
        
        // If we're at the end of this group's items increment elementCount, otherwise ... ?
        if (elementCount === 1)
         {
          elementCount = 0;
          injector = '';
         }
        else
         {
          elementCount++;
         }
      }
    
    setConfig({
               maxPosition : (maxWidth - 650),
               liWidth : 650
              });
              
    buildCarousel();
   }
  /**
   * Highlights the current page in the guide list
   * @param args
   */
  function checkActiveSource(args)
   {
    var args = args || {},
        guideLength = $('#contents ul li a[rel]').length,
        page;
    
    args.page !== undefined
     ? page = (parseInt(args.page) + 1)
     : page = 1;
     
     $.each($('#contents ul li a[rel]'), function(x, val)
                                         {
                                          if (parseInt($(this).attr('rel')) === page)
                                           {
                                            $(this).css('color','#333333');
                                            $('#contents ul li a[rel!=' + page + ']').css('color','#1c8cd8');
                                            
                                            lastPage = page;
                                           }
                                          
                                          if (parseInt($(this).attr('rel')) < lastPage && page < lastPage)
                                           {
                                            $('#contents ul li a[rel!=' + page + ']').css('color','#1c8cd8');
                                            
                                            //Highlight previous item since we're going backwards
                                            $($('#contents ul li a[rel]').get().reverse()).each(function()
                                                                                                 {
                                                                                                  if (parseInt($(this).attr('rel')) < lastPage)
                                                                                                   {
                                                                                                    $(this).css('color','#333333');
                                                                                                    return false;
                                                                                                   }
                                                                                                 });
                                           }
                                         });
   }
  
  function checkButtonState(args)
   {
    var next = $('.jcarousel-next', parent),
        prev = $('.jcarousel-prev', parent);
    
    if(args.position >= 0)
     {
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      prev.addClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      prev.attr('disabled','true');
      next.removeAttr('disabled');
     }
    
    if(args.position <= 0)
     {
      next.removeAttr('disabled');
      prev.removeAttr('disabled');
      prev.removeClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
     }
    
    if(args.position == '-'+args.maxPosition)
     {
      next.addClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      next.attr('disabled','true');
     }
    
    if(args.position === 0)
     {
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      prev.addClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      prev.attr('disabled','true');
     }
   }
  
  function getConfig()
   {
    return _config;
   }
  
  function init()
   {
    console.info('@Sources.init()');
    
    // Build side links
    buildGuide();
    
    // Build scroller & slideshow internals
    buildSlideShow();
    
    // Bind links
    bindLinks();
    
    checkActiveSource();
    
    //Fixing graphics for baseURL
    $('body').one('template.loaded', function()
                                      {
                                       app.template.fixImgPaths('div.frame');
                                       
                                       // Fixes the glossary use 
                                       if ($('a.contextual_glossary').length > 0)
                                        {
                                         $('a.contextual_glossary:eq(0)').trigger('click');
                                         $('div.contextual_view').remove();
                                        }
                                      });
    
    // This is a trick to get safari to update its scroller controls
    // TODO: Needs a better fix
    scrollSlideShow({
                     direction : 'prev'
                    });
    
    setTimeout(function()
                {                 
                 app.template.fixImgPaths('div.frame');
                }, 100)
   }
   
  function scrollSlideShow(args)
   {
    var carousel = $('ul#mycarousel', parent),
        condition,    
        currentPosition = (parseInt(carousel.css('left')) * -1),
        maxPosition = getConfig().maxPosition,
        value = 0,
        times = 0,
        liWidth = getConfig().liWidth;
    // Freezing controls so you cant brute click them, causes odd animations
    $('.jcarousel-next', parent).unbind();
    $('.jcarousel-prev', parent).unbind();
    
    //  Quirk work around for args.times because 0 would trigger a false case if we did this in an inline conditional definition
    if (args.times !== undefined)
     {
      carousel.css('left','0px');
      currentPosition = 0;
      
      if (parseInt(args.times) === 1)
       {
        //JSON is reporting that the page number is 1 so we want to scroll to position 0
        times = 0;
       }
      else
       {
        times = parseInt(args.times - 1);
       }
     }

    if (args.times === undefined)
     {
      times = 1;
     }
    
    if (args.direction === 'next')
     {     
      condition = currentPosition <= maxPosition;

      value = (((currentPosition + -liWidth * -1) * times) <= maxPosition)
               ? ((currentPosition * -1) - liWidth) * times
               : '-'+maxPosition;
     }
    else
     {      
      condition = (currentPosition * 1) >= 0;
      value = ((currentPosition + -liWidth * 1) >= 0 )
               ? parseInt(carousel.css('left')) + liWidth 
               : 0;
     }

    if (condition)
     {         
      carousel.animate({
                        left : value + 'px'
                       }, 'normal', function()
                                     {
                                      // Rebinding controls
                                      bindLinks();
                                     });
      
      checkButtonState({
                        position : value,
                        maxPosition : getConfig().maxPosition
                       });
      
      checkActiveSource({
                         page : ((value / liWidth) * -1)
                        });
     }
   }
  
  function setConfig(args)
   {
    _config = $.extend({
                        link : this
                       }, args);
   }
 }
 
App.prototype.thisTemplate = new Sources({
                                           'link' : ale
                                          });