function GlobalMasthead(app)
 {
  // Private methods
  // ---------------
  function bars()
   {
    var currentPage = getCurrentPage() - 1,
        totalPages = getTotalPages(),
        html = [],
        classes = '',
        multiple = 2, // Number of digits to round to
        number = (139 - totalPages) / totalPages,
        styles = '',
        liWidth = Math.round(number * multiple) / multiple;
    
    var x;
    for (x = 0; x < getTotalPages(); x++) {
      // Set current class
      if (x === getCurrentPage()) {
        classes = 'current';
       } else {
        classes = ''; 
       }
       
      if (classes !== '') {
        classes = ' class="' + classes + '"';
       }
      
      html.push('<li',
                classes,
                ' style="width:',
                liWidth,
                'px"',
                '></li>'
               );
     }

    return html.join('');
   }

  function buildHTML()
   {
    var html = [];

    $(html.join('')).insertAfter('#global_masthead');
    
    
    //Bind headers from package data
    if (app.getPackageData().packageData[0].headerObjective !== undefined) {
      $('#global_masthead h2').html(app.getPackageData().packageData[0].headerObjective);
     }
    
    // Added a leading space because of IE padding issues - IE will render this space and Firefox does not  
    if (app.getPackageData().packageData[0].headerScenario !== undefined) {
      $('#global_masthead h3').html(' ' + app.getPackageData().packageData[0].headerScenario);
     }
   }

  function getCurrentPage()
   {
    return app.getCurrentPage();
   }

  function getTotalPages()
   {
    return app.getPagesObject().pages.length - 1;
   }

  function init()
   {
    render({
            currentPage : app.getCurrentPage(),
            callback : app.template.applyGlobalMasthead
           });
   }

  function populateData()
   {
    var currentPage = app.getCurrentPage() + 1,
        totalPages = getTotalPages();
        
    $('#progress_bar_step_current').html(currentPage);
    $('#progress_bar_step_total').html(totalPages);
   }

  function render(args)
   {
    app.setCurrentPage(args.currentPage);
    
    var currentPage = app.getCurrentPage(),
        callback = args.callback;

    buildHTML();
    populateData();
    callback();
   }


  // Public interface
  // ----------------
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.globalMasthead = new GlobalMasthead(ale);