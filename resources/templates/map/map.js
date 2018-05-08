function Map(app)
 {
  // Private vars
  // ------------ 
      // Stores the timeout session defined in bindEvents()
  var timeoutHolder;

  // Private methods
  // ---------------
  function bindEvents()
   {
    var delay = app.template.getData().content[0].screenshotDelay || 1750;
    
    // Set timer
    timeoutHolder = window.setTimeout(function ()
                                       {
                                        // TODO: eventually check the template name from getData()
                                        // instead of an arbitrary template object
                                        if ($('img#data_screenshotURL').length < 1) {
                                          return;
                                         }
                                        
                                        app.lightbox.render({
                                                             attachCloseEvent : false,
                                                             callback : ale.thisTemplate.lightboxLoaded,
                                                             global : ale,
                                                             data : {
                                                                     type : 'map',
                                                                     content : {
                                                                                html : ale.thisTemplate.createLightboxHTML()
                                                                               }
                                                                    },
                                                             id : ale.lightbox.getFreshLightboxId(),
                                                             size : 'map'
                                                            });
                                       }, delay);
   }

  function buildAttemptString(args)
   {
    var attemptNumber = args.attemptNumber,
        attemptString = [],
        totalAttempts = args.totalAttempts;
        
    // Check totalAttempts
    
    if (totalAttempts < 1 || totalAttempts === undefined) {
      totalAttempts = 'unlimited';
     }
     
    // Build the attemptString
    attemptString.push(attemptNumber, ' of ', totalAttempts);
        
    return attemptString.join('');
   }

  function createLightboxHTML()
   {
    var attemptNumber = app.externalConfig().attemptNumber || 1,
        content = app.template.getData().content[0],
        fullDueDate = app.externalConfig().dueDate || content.dueDate,
        html = [],
        totalAttempts = app.externalConfig().totalAttempts || content.attempts,
        
        // Build attempts var string
        attempts = buildAttemptString({
                                       attemptNumber : attemptNumber,
                                       totalAttempts : totalAttempts
                                      });
    
    // Parse due date
    var dueDate = parseDueDate(fullDueDate);
    
    html.push('<div id="top_container">');
    html.push('<div><img src="/s3scorm/ale/content/assets/', content.destinationLogo, '" width="58" height="75"></div>');
    html.push('<div><p>', content.scenario, '</p>');
    html.push('<h2>', content.assignmentName, '</h2>');
    html.push('</div>');
    html.push('</div> <!-- top_container -->');
    html.push('<div id="bottom_container">');
    html.push('<div id="bottom_container_left">');
    html.push('<div id="data_videoURL"></div>');
    html.push('</div> <!-- bottom_container_left -->');
    html.push('<div id="bottom_container_right">');
    html.push('<div class="block_container">');
    html.push('<h2>assignment details</h2>');
    html.push('<div class="block_body_container">');
    html.push('<ul><li>due:</li><li class="assignment_result">', dueDate, '</li></ul>');
    html.push('<ul><li>attempt:</li><li class="assignment_result">', attempts, '</li></ul>');
    html.push('<input type="button" value="" class="assignment_button">');
    html.push('</div>');
    html.push('</div>');
    html.push('</div> <!-- bottom_container_right -->');
    html.push('</div> <!-- top_container -->');
    return html.join('');
   }

  function init()
   {
    render();
   }

  function lightboxLoaded()
   {
    // Remove timeout
//    window.clearTimeout(timeoutHolder);
    
    // Show the map screenshot
    $('img#data_screenshotURL').css({
                                     'width' : $('div#data_mapURL object').width()
                                    })
                               .show();
    
    // Hide map flash element
    $('div#data_mapURL').hide();
    
    // Bind all lightbox data which includes creating the video element
    app.template.bindData({
                           source : app.template.getData().content[0]
                          });
    
    // Bind continue button
    $('div#bottom_container_right input').bind('click', function ()
                                                         {
                                                          app.getTest().ungateThisTest();
                                                          app.doNext();
                                                          return false;
                                                         });
   }

  function parseDueDate(fullDueDate)
   {
    var dueDateString = [];
        
    // Split fullDueDate
    fullDueDate = fullDueDate.split(' ');
    
    dueDateString.push(fullDueDate[1], ' ', fullDueDate[2], ', ', fullDueDate[5]);
    
    return dueDateString.join('');
   }

  function render()
   {
    $('body').one('template.loaded', function()
                                      {
                                       resizeMap();
                                       bindEvents();
                                      });
   }

  function resizeMap()
   {
    // Get dimensions from viewport
    var viewportWidth = ($(window).width() - 200 > 900) 
                      ? 900 
                      : ($(window).width() - 200 < 467)
                      ? 467
                      : $(window).width() - 200,
        viewportHeight = viewportWidth * 0.64155;
    
    // Set object width
    $('object#swf_mapURL, object#swf_mapURL object').width(viewportWidth);
    $('object#swf_mapURL, object#swf_mapURL object').height(viewportHeight);
   }
  
  // Public interface
  // ----------------
  this.createLightboxHTML = createLightboxHTML;
  this.init = init;
  this.lightboxLoaded = lightboxLoaded;
 }

App.prototype.thisTemplate = new Map(ale);

ale.thisTemplate.init();