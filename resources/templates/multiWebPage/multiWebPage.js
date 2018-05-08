/**
 * MultiWebPage template constructor function
 * @param args
 * @return
 */
function MultiWebPage(args)
 {
  var _config = {};
  setConfig(args);
  
  var app = getConfig().link,
      console = new Console(),
      
      // Get slide data from json
      slideShows = app.template.getData().content[0].slideShows,
      
      // Loop through all the slides and count how many images there are in total
      itemsCount = (function ()
                     {
                      var itemsCount = 0;
                      
                      for (obj in slideShows)
                       {
                        var imagesLength = slideShows[obj].images.length;
                        
                        for (var x = 0; x < imagesLength; x++)
                         {
                          itemsCount++;
                         }
                       }
                      
                      return itemsCount;
                     }());

  init();

  function bindLinks(args)
   {
    // Due to content changes we are skipping the first page
    // and going directly to the scroller.  The function below is
    // commented out and the CSS is reversed so webpage_images_container
    // has display : none and scroller_content_container is now shown
    
//    $('div#webpage_images_container').bind('click', function ()
//                                                     {
//                                                      $('div#webpage_images_container').hide();
//                                                      $('div#scroller_content_container').show();
//                                                     });
    
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
                             var totalWidths = getConfig().maxWidth;
                             
                             // $('ul#mycarousel li').each(function (index)
                                                         // {
                                                          // totalWidths = totalWidths + parseInt($(this).css('width').split('px')[0]) + 30;
                                                         // });
                             
                             // If the display width is less than needed to scroll
                             // Scroll buttons will be removed
                             totalWidths <= 800
                                               ? $('div.jcarousel-prev-horizontal, div.jcarousel-next-horizontal').hide()
                                               : null;
                             
                             return totalWidths;
                            })();
                           
    // Set <ul> width
    $('ul#mycarousel').width(calculatedWidths);
    
    $('.jcarousel-next').click(function ()
                                {
                                 scrollSlideShow({
                                                  direction : 'next',
                                                  itemsCount : args.itemsCount
                                                 });
                                });
    
    $('.jcarousel-prev').click(function ()
                                   {
                                    scrollSlideShow({
                                                     direction : 'prev',
                                                     itemsCount : args.itemsCount
                                                    });
                                   });
    
//    $('.frame').click(function ()
//                       {
//                        $('div#scroller_content_container').hide();
//                        $('div#webpage_images_container').show();
//                       });
      
    $('div.jcarousel-prev, div.jcarousel-next').append('<a class="niftyFix"></a>')
    
    Nifty('div.jcarousel-prev-horizontal','left');
    Nifty('div.jcarousel-next-horizontal','right');
    Nifty('div.jcarousel-container');
    
    // Fix for safari because the correct class does not initially register for the next button
    $('.jcarousel-prev').trigger('click');
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
        
        itemsCount = args.itemsCount,
        
        // Used to add a class to the last element of a group
        injector = '',
        
        // Max width for carousel ul
        maxWidth = 0;
    
    // Loop through the images in each slide
    for (obj in slideShows)
     {
      var imagesLength = slideShows[obj].images.length;
      
      /**
       * Create the following structure for each element of each group:
       * <li class="...">
       *   <div class="frame">
       *     <h3>{header}</h3>
       *     <div class="data_slide">
       *       <img src="{image url}">
       *     </div>
       *   </div>
       * </li>
       */
      (function() {
      for (var x = 0; x < imagesLength; x++)
       {
        // Restrict header to getting shown only once per group
        header = (elementCount === 0)
                  ? header = slideShows[obj].slide
                  : '&nbsp;';
         
        // If we are at the last item of the group, add a divider class
        
        // Build html <li> wrappers for each div
        // Wait to append to #mycarousel until the end
        var liContainer = document.createElement('li');
        liContainer.className = ['jcarousel-item ',
                                 'jcarousel-item-horizontal ',
                                 'jcarousel-item-', (elementCount + 1), '-horizontal '].join('');
        liContainer.setAttribute('jcarouselindex', (elementCount + 1));
        
        
        // Create frame <div> and append to <li>
        var divContainer = document.createElement('div');
        divContainer.className = "frame";
        liContainer.appendChild(divContainer);

        // Create header <p> element and append to frame <div>
        var headerContainer = document.createElement('p');
        headerContainer.innerHTML = header;
        divContainer.appendChild(headerContainer);
        
        // Create data_slide <div> element and append to frame <div>
        var newDiv = document.createElement('div');
        newDiv.setAttribute('class', 'data_slide');
        divContainer.appendChild(newDiv);
        
        // Create slide <img> and append to newdiv <div>
        
        var imageWidth,
            newImage = loadImage({
                                  imgIndex : x,
                                  objIndex : obj
                                 });
        
        $(newDiv).append(newImage);
        
        // Append everything to #mycarousel
        var mycarousel = document.getElementById('mycarousel');
        mycarousel.appendChild(liContainer);
        
        $(newImage).load(function() {
         injector = (elementCount === (imagesLength - 1)) 
         ? 'injector' 
           : '';
         $(liContainer).addClass(injector);
        // In case images are not correctly resized (via photoshop)
        if (newImage.width > 270)
         {
          newImage.width = 266;
         }
        
        if (newImage.height > 210)
         {
          newImage.height = 210;
         }
        
        imageWidth = $(newImage).width() || 266;
        
        // IE7 Fix for images receiving default values
        $(newImage).removeAttr('height')
                   .removeAttr('width');
        
        // Set needed fixed width before jcarousel runs
        if ($('body').hasClass('SP_SC01a_02'))
         {
          liContainer.style.width = (newImage.width > 0) 
                                     ? (newImage.width + 12 + ((injector !== '') 
                                                                ? 13 
                                                                : 0)) + 'px' 
                                     : '278px'; 
         }
        else
         {
          liContainer.style.width = (imageWidth > 0) 
                                     ? (imageWidth + 12 + ((injector !== '') 
                                                                ? 32 // Add 43px for the injector width
                                                                : 0)) + 'px' 
                                     : '278px'; // 12 is added for 5px padding and 1px border, the 278 part is a total IE hack since I can't figure out how to get the element width in IE
         }
         
        // Calculate widths, add 30 pixels for padding             
        maxWidth = maxWidth + (parseInt(liContainer.style.width)+30);
        // If we're at the end of this group's items increment elementCount, otherwise ... ?
        if (elementCount === (imagesLength - 1))
         {
          elementCount = 0;
          injector = '';
          maxWidthSet();
         }
        else
         {
          elementCount++;
         }
        });
       }
      })();
     }

    function maxWidthSet(){
    setConfig({
     maxWidth : maxWidth,
               maxPosition : (maxWidth - 875)
              });
    }
   }
  
  function checkAutoWidths()
   {
    var leng = 0,
        mycarousel = $('#mycarousel');
    
    if ($('body').hasClass('autoWidth'))
     {
      $('li').css('width', 'auto');
      
      setConfig({
                 maxPosition : 1000
                });
      
      mycarousel.height('100%');
      
      var timer = 0;
      var timeout = setInterval(function()
                  {
                   $('li').each(function()
                                 {
                                  leng += (parseInt($(this).width()) + 10);
                                 });
                   
                   setConfig({
                              maxPosition : (leng - 900)
                             });
                   
                   // If images did not load in time to have their sizes caught, then ensure on second pass that they are correct
                   if (mycarousel.width() < getConfig().maxPosition + 950)
                    {
                     mycarousel.width(getConfig().maxPosition + 950);
                    }
                   timer ++
                   if(timer === 10) {
                	   clearInterval(timeout);
                   }
                  }, 500);
     }
   }
  
  function checkButtonState(args)
   {
    var next = $('.jcarousel-next'),
        prev = $('.jcarousel-prev');
    
    if(args.position >= 0)
     {
      next.removeClass('jcarousel-next-disabled jcarousel-next-disabled-horizontal');
      prev.addClass('jcarousel-prev-disabled jcarousel-prev-disabled-horizontal');
      prev.attr('disabled','true');
     }
    
    if(args.position < 0)
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
   }

  function getConfig()
   {
    return _config;
   }
  
  function init()
   {
    // Round corners
    Nifty('div#webpage_images_container', 'tl');
    
    // Build scroller
    buildSlideShow({
                    itemsCount : itemsCount
                   });
    
    // Bind links
    bindLinks({
               itemsCount : itemsCount
              });
    
    checkAutoWidths();
    
    app.template.fixImgPaths();
   }
  
  function loadImage(args)
   {
    var imgIndex = args.imgIndex || 0,
        objIndex = args.objIndex || 0,
        newImage = $("<img />").attr('src', '/s3scorm/ale/content/assets/' + slideShows[objIndex].images[imgIndex])
                               .addClass('data_slide');

    return newImage;
   }
  
  function scrollSlideShow(args)
   {
    var carousel = $('ul#mycarousel'),
        condition,    
        currentPosition = (parseInt(carousel.css('left')) * -1),
        maxPosition,
        value;
    
    if($('body').hasClass('SP_SC01a_02')) 
     {
      maxPosition = parseInt((args.itemsCount * 610)-611);
      if (args.direction === 'next')
       {
        condition = currentPosition <= maxPosition;
        value = ((currentPosition + -200 * -1) <= maxPosition)
                 ? (currentPosition * -1) - 610 
                 : '-'+maxPosition;
       }
      else
       {
        condition = (currentPosition * 1) >= 0;
        value = ((currentPosition + -200 * 1) >= 0 )
                 ? parseInt(carousel.css('left')) + 610
                 : 0
       }
     } 
    else 
     {
      maxPosition = getConfig().maxPosition;
      
      if (isNaN(maxPosition))
       {
        maxPosition = ($('#mycarousel').width() - 945);
       }
      
      if (args.direction === 'next')
       {
        condition = currentPosition <= maxPosition;
        value = ((currentPosition + -200 * -1) <= maxPosition)
                 ? (currentPosition * -1) - 200 
                 : '-'+maxPosition;
       }
      else
       {
        condition = (currentPosition * 1) >= 0;
        value = ((currentPosition + -200 * 1) >= 0 )
                 ? parseInt(carousel.css('left')) + 200 
                 : 0
       }
     }
    
    if (condition)
    {   
     carousel.animate({
                       'left' : value + 'px'
                      });
     
     checkButtonState({
                       'position' : value,
                       'maxPosition' : maxPosition
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
 
App.prototype.MultiWebPage = new MultiWebPage({
                                               'link' : ale
                                              });