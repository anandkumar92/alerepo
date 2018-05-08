function GlobalNavigation(app)
 {
  function buildBackLink()
   {
    $('#nav_container').addClass('leftTop').append($('<div class="buttons_sprite conclusion">&nbsp;</div>').bind('click', function()
                                                                                             {
                                                                                              app.doPrevious();
                                                                                             }));
   }
  
  function bindEvent()
   {
    $('#nav_right_btn, #nav_next_link').unbind('click').bind('click', function()
                                                       {
                                                        if(!$(this).hasClass('disabled'))
                                                         {
														$(this).addClass('disabled');
                                                          app.doNext();     
                                                         }
                                                       });
   }
  
  function nextLink()
   {
    var currentPage = app.getCurrentPage(),
        pagesObject = app.getPagesObject().pages[currentPage],
        html = ['<div id="nav_right_btn" class="buttons_sprite next'];
   
   if (pagesObject.gatedTest === 'true' && app.getTestCompleted(pagesObject.name) !== true) 
    {
     html.push(' disabled');
     html.push('">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><span class="disabled" id="nav_next_link">Next:&nbsp;', app.getPagesObject().pages[currentPage + 1].title || '', '</span>');
    }
   else
    {
     html.push('">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div><span id="nav_next_link">Next:&nbsp;', app.getPagesObject().pages[currentPage + 1].title || '', '</span>');   
    }
   
   return html.join('');
  }
  
  function init()
   {
    render({
            currentPage : app.getCurrentPage()
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

  function render(args)
   {
    var callback = args.callback,
        lastPage = ((app.getPageArray().length - 1) - args.currentPage);

    if (lastPage > 1) 
     {
      $('#navigation_container').attr('id', 'nav_container');
      $('#nav_container').append(nextLink());
      bindEvent();
     }
    else
     {
      buildBackLink();   
     }
    // toggle save & exit button in global_masthead
    App.prototype.globalMasthead.toggleSaveButton(app.externalConfig.roleName !== 'I' && app.isIframe() === 'true');
    callback && callback();
   }

  // Public interface
  // ----------------
  this.render = render;
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.globalNavigation = new GlobalNavigation(ale);