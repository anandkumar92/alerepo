function GlobalNavigation(app)
 {
  // Private methods
  // ---------------
  function createPaginationLink(id)
   {
    var classes = '',
        currentPage = app.getCurrentPage,
        html = [],
        pagesObject = app.getPagesObject(),
        wrapper = 'a';
        
    // Exit if visibility is set to 'hidden' in config
    if (!isVisible(id, app.getPagesObject())) {
      return;
     }
    
    // Check if the element is a clickable link or not
    if (isAccessible(id)) {
      wrapper = 'a';
     } else {
      classes += ' blocked';
      wrapper = 'span';
     }
    
    // Check if the item is the current page or not
    if (id === app.getCurrentPage()) {
      classes += ' current';
     }
     
    // Check if the item is first in the list
    if (isFirst(id)) {
      classes += ' first';
     }
    
    // Check if the item is the last in the list
    if (isLast(id + 2)) {
      classes += ' last';
     }
    
    html.push('<',
              wrapper,
              ' title="',
              id + 1,
              '" class="ALE_goToPage button',
              classes,
              '">',
              app.getPagesObject().pages[id].title,
              '</',
              wrapper,
              '>');
    
    return html.join('');
   }

  function ebookLink() 
   {
    var html = [];
    
    if (app.externalConfig().ebookUrl !== undefined) {
      html.push('<a class="ebook_link" href="', app.externalConfig().ebookUrl, '" target="new">eBook</a>');
     }
    
    return html.join('');
   }
  
  function fullGlossary()
   {
    var html = [];
    
    html.push('<a class="full_glossary glossary" href="#"></a>');
    
    return html.join('');
   }

  function init()
   {
    render({
            currentPage : app.getCurrentPage(),
            callback : app.template.applyGlobalNav
           });
   }

  function isAccessible(id)
   {
    return (app.getLastKnownPage() >= id) ? true : false;
   }

  function isFirst(id)
   {
    return (id === 0) ? true : false;
   }

  function isLast(id)
   {
    return (id === app.getPageArray().length) ? true : false;
   }

  function isVisible(id)
   {
    return (app.getPagesObject().pages[id].visibility === 'hidden') ? false : true;
   }

  function logo()
   {
    var html = [];
    
    html.push('<div class="logo sprite"></div>');
     
    return html.join('');
   }

  function nextLink()
   {
    var html = [],
        classes = '',
        currentPage = app.getCurrentPage(),
        pagesObject = app.getPagesObject().pages[currentPage];
    
    // Check if the current page is the last page, and...
    // Check if the current page is a gatedTest, if so disable the next button.
    // Don't worry, the test will enable it later.
    if (isLast(currentPage + 2) || (pagesObject.gatedTest === 'true' && app.getTestCompleted(pagesObject.name) !== true)) {
      classes = ' disabled';
     }
    
    html.push('<a href="" class="ALE_next button',
              classes,
              '">Next</a>');
    
    return html.join('');
   }

  function pages()
   {
    var html = ['<div id="page_array_container">',
                '<div id="nav_menu_header"><div><span id="nav_menu_header_graphic" class="sprite">Activities</span><a href="" id="nav_menu_close" class="sprite">close</a></div></div><div class="mask"></div><ul>'];
    
    var x;
    for (x = 0; x < (app.getPageArray().length - 1); x += 1) {
      html.push('<li>',
                createPaginationLink(x),
                '</li>');
     }
    
    html.push('</ul></div><a id="menu_button" href="">Menu</a>');
    
    return html.join('');
   }

  function previousLink()
   {
    var classes = '',
        html = [];
    
    // Check if the current page is the first
    if (isFirst(app.getCurrentPage())) {
      classes = ' disabled';
     }
    
    html.push('<a href="" class="ALE_previous button',
              classes,
              '">Previous</a>');
    
    return html.join('');
   }

  function render(args)
   {
    var globalNav = $('#global_navigation'),
        callback = args.callback,
    
        // Check if they are on the last page, if so, don't display the navigation links
        // UPDATE (7/09/10): Last page acces has been removed.
        lastPage = ((app.getPageArray().length - 1) - app.getCurrentPage());
    
    app.setCurrentPage(args.currentPage);
    
    $(logo()).insertBefore(globalNav);
    
    // 
    if (lastPage > 0) {
      $(pages()).appendTo('#global_navigation');
      globalNav.prepend(previousLink());
      globalNav.prepend(fullGlossary());
      globalNav.prepend(ebookLink());
      globalNav.append(nextLink());
     }
   
    if(app.externalConfig.roleName !== 'I' && app.isIframe() === 'true') {
      $(saveAndExitLink()).insertAfter(globalNav);
     }
     
    callback();
   }

  function saveAndExitLink()
   {
    var classes = 'ALE_save_and_exit',
        html = [];
    
    if (app.getCurrentPage() === (app.getPageArray().length - 2)) {
      classes = 'ALE_finish';
     }
    
    html.push('<a href="#" class="button ',
              classes,
              '">save & exit</a>');
    
    return html.join('');
   }

  
  // Public interface
  // ----------------
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.globalNavigation = new GlobalNavigation(ale);