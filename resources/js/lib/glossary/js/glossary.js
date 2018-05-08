/**
 * Glossary plugin class
 * @param app
 * @returns {Glossary}
 */
function Glossary(app)
 {
  // Private vars
  // ------------
  var data = {},_id,
      baseURL = app.baseURL,
      contextual_html = [],
      console = app.console,
      contextualview_x,
      contextualview_y,
      
      /** Stores HTML string for full glossary. Set on loadData() success */
      full_html = [],
      
      fullview_height,
      fullview_x,
      id = '#Glossary';


  // Private methods
  // ---------------
  /**
   * Binds click events to various elements including:
   * a.full_glossary
   * .contextual_glossary
   * .full_view_alpha_content
   * .full_view_alphaorder
   * @returns false or undefined
   */
  function bindEvents() 
   {
    $("a.full_glossary").die("click.glossaryFullView")
                        .live("click.glossaryFullView", function (e)
                                                         {
                                                          if ($("#Glossary").length > 0 && $("#Glossary").hasClass("full_view")) {
                                                            $("#Glossary").remove();
                                                            $(".full_glossary").removeClass("glossary_active")
                                                                               .addClass("glossary");
                                                           } else {
                                                            $(this).removeClass("glossary")
                                                                   .addClass("glossary_active"); 
                                                            show('', e);
                                                           }
                                                          return false;
                                                         });
    $(".contextual_glossary").die("click.glossaryContextualView")
                             .live("click.glossaryContextualView", function (e)
                                                                    {
                                                                     show.call(this, htmlEncode($(this).text()), e);
                                                                     return false;
                                                                    });
                                                      
    $(".full_view_alpha_content", ".full_view_content_wrapper").show();
    
    $(".full_view_alphaorder").die("click.glossaryAlphaLink")
                              .live("click.glossaryAlphaLink", function (e) 
                                                                {
                                                                 if (!$(e.target).hasClass("alpha_disable") && $(e.target).is("a")) {
                                                                   if ($(e.target).hasClass("alpha_highlight")) {
                                                                     $(e.target).removeClass("alpha_highlight");
                                                                     $(".full_view_alpha_content", ".full_view_content_wrapper").show();  
                                                                    } else {
                                                                     var identifier = e.target.id;
                                                                     $("a", ".full_view_alphaorder").removeClass("alpha_highlight");
                                                                     $(e.target).addClass('alpha_highlight');
                                                                     $("."+identifier, ".full_view_content_wrapper").hide();
                                                                     $(".full_view_alpha_content", ".full_view_content_wrapper").hide()
                                                                                                                                .filter("."+identifier).show();
                                                                    }
                                                                  }
                                                                 return false;
                                                                });
   }

  /**
   * Enables closing full glossary by clicking either the icon or the document
   * Changes the CSS class of the glossary icon
   * NOTE: There is no active graphic for this icon though we have the capacity 
   *       to support one via this method
   */
  function closeModal()
   { 
    var glossary = getContainer();
    
    $('.full_view_close').unbind("click.glossary")
                         .bind('click.glossary', function ()
                                                  {
                                                   // Using empty to remove bindings
                                                   glossary.css('display', 'none')
                                                           .empty()
                                                           .remove();
                                                   
                                                   $("a.full_glossary").removeClass("glossary_active")
                                                                       .addClass("glossary");
                                                  });
    
    $('body').unbind("click.glossary")
               .bind("click.glossary", function (e) 
                                        {
                                         var targetObj = $(e.target);
                                         
                                         if (!(targetObj.hasClass('contextual_glossary')) && !(targetObj.hasClass('full_glossary')) && !(targetObj.parents('#Glossary').length)) 
                                          {
                                           // Using empty to remove bindings
                                           glossary.css('display', 'none')
                                                   .empty()
                                                   .remove();
                                           
                                           $("a.full_glossary").removeClass("glossary_active")
                                                               .addClass("glossary");
                                          }
                                        });
   }

  /**
   * Adjusts the position of the contextual glossary element
   * @param {event.target} click_target
   */
  function createContextualCSS(click_target)
   {
    var glossary = getContainer();
    
    contextualModalPosition(click_target);
    glossary.css({
                  bottom : 'auto',
                  top : contextualview_y + 'px',
                  left : contextualview_x + 'px'
                 });
   }
  
  /**
   * Assembles HTML for contextual glossary elements
   * @returns {string} string of HTML elements 
   */
  function createContextualHTML()
   {
    var html = [];
    
    html.push('<div class="pointer"></div>');
    html.push('<div class="bodydiv" id="data_glossary"></div>');
    
    return html.join('');
   }

  /**
   * Sets up CSS for full glossary element
   */
  function createFullCSS()
   {
    var glossary = getContainer();
    
    fullModalPosition();
    glossary.css({
                  bottom  : '20px',
                  left : fullview_x + 'px',
                  position : 'fixed',
                  top : 'auto'
                 });
    $("div.full_view_content_wrapper").css({
                                            height : fullview_height + 'px'
                                           });
   }

  /**
   * Assembles HTML for full glossary element
   * @param data
   * @returns
   */
  function createFullHTML(data)
   {
    var alpha_order = "",
        classname,
        html = [],
        temp;
        
    html.push('<div class="full_view_header_wrapper">');
    html.push('<div class="full_view_header">');
    html.push('<span class="full_view_title">Glossary</span>');
    html.push('<a href="#" class="full_view_close"></a>');
    html.push('</div>');
    html.push('<div class="full_view_alphaorder">');
    html.push('<a href="#" id="a_alpha">');
    html.push('a');
    html.push('</a>');
    html.push('<a href="#" id="b_alpha">');
    html.push('b');
    html.push('</a>');
    html.push('<a href="#" id="c_alpha">');
    html.push('c');
    html.push('</a>');
    html.push('<a href="#" id="d_alpha">');
    html.push('d');
    html.push('</a>');
    html.push('<a href="#" id="e_alpha">');
    html.push('e');
    html.push('</a>');
    html.push('<a href="#" id="f_alpha">');
    html.push('f');
    html.push('</a>');
    html.push('<a href="#" id="g_alpha">');
    html.push('g');
    html.push('</a>');
    html.push('<a href="#" id="h_alpha">');
    html.push('h');
    html.push('</a>');
    html.push('<a href="#" id="i_alpha">');
    html.push('i');
    html.push('</a>');
    html.push('<a href="#" id="j_alpha">');
    html.push('j');
    html.push('</a>');
    html.push('<a href="#" id="k_alpha">');
    html.push('k');
    html.push('</a>');
    html.push('<a href="#" id="l_alpha">');
    html.push('l');
    html.push('</a>');
    html.push('<a href="#" id="m_alpha">');
    html.push('m');
    html.push('</a>');
    html.push('<a href="#" id="n_alpha">');
    html.push('n');
    html.push('</a>');
    html.push('<a href="#" id="o_alpha">');
    html.push('o');
    html.push('</a>');
    html.push('<a href="#" id="p_alpha">');
    html.push('p');
    html.push('</a>');
    html.push('<a href="#" id="q_alpha">');
    html.push('q');
    html.push('</a>');
    html.push('<a href="#" id="r_alpha">');
    html.push('r');
    html.push('</a>');
    html.push('<a href="#" id="s_alpha">');
    html.push('s');
    html.push('</a>');
    html.push('<a href="#" id="t_alpha">');
    html.push('t');
    html.push('</a>');
    html.push('<a href="#" id="u_alpha">');
    html.push('u');
    html.push('</a>');
    html.push('<a href="#" id="v_alpha">');
    html.push('v');
    html.push('</a>');
    html.push('<a href="#" id="w_alpha">');
    html.push('w');
    html.push('</a>');
    html.push('<a href="#" id="x_alpha">');
    html.push('x');
    html.push('</a>');
    html.push('<a href="#" id="y_alpha">');
    html.push('y');
    html.push('</a>');
    html.push('<a href="#" id="z_alpha">');
    html.push('z');
    html.push('</a>');
    html.push('</div>');
    html.push('</div>');
    html.push('<div class="full_view_body_wrapper">');
    html.push('<div class="full_view_content_wrapper">');
    
    temp = [].concat(data.terms);
    
    var desc, // description array
        elem; // element reference in array
    // Reduce the amount of object property access while iterating.
    while (elem = temp.shift()) 
     {
      classname = elem.name.charAt(0).toLowerCase() + "_alpha";
      html.push('<div class="full_view_alpha_content ', classname, '">');
      html.push('<span class="full_view_alpha_content_heading">');
      html.push(elem.display || elem.name);
      html.push('</span>');
      desc = [].concat(elem.description);
      while (elem = desc.shift()) 
       {
        html.push('<p>', elem, '</p>');
       }
      html.push('</div>');
     }
    
    return html.join('');
   }

  function fullModalPosition()
   {
    var glossary = getContainer();
    fullview_x = ($(window).width() - glossary.width())/2;
    fullview_height = $(window).height() - $("div.full_view_header_wrapper").height() - 80;
   }

  function getContainer()
   {
    var glossary_container = $("#Glossary");
    if (glossary_container.length === 0) {
      glossary_container = $('<div id="Glossary"></div>').appendTo('body');
     }
    
    return glossary_container;
   }

  function getData()
   {
    return data;
   }
  
  function htmlEncode(source)
   {
    var result = ''; 
    
    source = source.replace(/\&/g,'&amp;');
    source = source.replace(/\</g,'&lt;');
    source = source.replace(/\>/g,'&gt;');
    
    var i,
        c,
        len = source.length;
    for (i = 0; i < len; i++) {
      c = source.charAt(i);
      if (c < ' ' || c > '~') {
        c = '&#' + c.charCodeAt() + ';';
       }
      result += c;
     }
    
    return result;
   }
  
  /**
   * Initializes everything
   * Calls:
   * loadData()
   * loadCSS()
   * bindEvents()
   */
  function init()
   {
    loadData();
    loadCSS();
    bindEvents();
   }
  
  /**
   * Creates and injects a <link> element into the document head
   */
  function loadCSS()
   {
    var cssNode = document.createElement('link'),
        headID = document.getElementsByTagName("head")[0];
    
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href = app.baseURL + 'resources/js/lib/glossary/css/glossary.css';
    cssNode.media = 'screen';
    headID.appendChild(cssNode);
   }
  
  /**
   * Gets glossary.json data and sets up full and contextual glossary HTML
   */
  function loadData()
   {
    $.ajax({
            dataType: 'json',
            url: '/s3scorm/ale/content/glossary/glossary.json',
            async: false,
            cache: false,
            success: function (result)
                      {
                       data = result;
                       full_html = createFullHTML(getData());
                       contextual_html = createContextualHTML();
                      }, 
            error: function (XMLHttpRequest, textStatus, errorThrown)
                    {
                     console.info('ERROR => XMLHttpRequest:');
                     console.debug(XMLHttpRequest);
                     console.info('ERROR => textStatus:');
                     console.debug(textStatus);
                     console.info('ERROR => errorThrown:');
                     console.debug(errorThrown);
                     return false;
                    }
           });
   }

  /**
   * Adjusts CSS position based on elem offset
   * @param {event.target} elem Event returned from click
   */
  function contextualModalPosition(elem)
   {
    var pos = $(elem).offset();
    
    contextualview_x = parseInt(pos.left + 20);
    contextualview_y = parseInt(pos.top + 40);
   }

  /**
   * Shows the full glossary or contextual glossary element depending on what
   * was clicked (e.g., a.full_glossary or contextual glossary link) 
   * @param {string} term contextual glossary link
   * @param {object} click e.target object from click event
   */
  function show(term, click)
   {
    var glossary = getContainer();
    
    if (glossary.hasClass("full_view")) {
      $("a.full_glossary").removeClass("glossary_active")
                          .addClass("glossary");
     }
     
    glossary.removeClass("contextual_view")
            .removeClass("full_view")
            .empty();
            
    if (!term) {
      glossary.addClass("full_view")
              .append(full_html);
      
      glossary.glossary();
      createFullCSS();
      $(".full_view_alphaorder").children()
                                .each(function () 
                                       {
                                        var identifier = this.id;
                                        
                                        if ($("." + identifier, "div.full_view_content_wrapper").length === 0) {
                                          $(this).addClass("alpha_disable");
                                         }
                                       });
       $(window).unbind("resize")
                .bind("resize", function ()
                                 {
                                  createFullCSS();
                                 });
                                 
     } else {
      glossary.addClass('contextual_view')
              .append(contextual_html);
      
      var dataClass = $(this).attr('class').split(' ')[1],
          index = 0, //by default index is 0
          documentFragment = [],
          terms = [].concat(getData().terms);
      
      if (dataClass) {
        index = dataClass.split('_')[1];
       }
      
      var elem;
      
      while (elem = terms.shift())
       {
        if (term.toLowerCase() === elem.name.toLowerCase()) 
         {
          documentFragment.push('<h3>');
          documentFragment.push(elem.display || term);
          documentFragment.push('</h3>');
          documentFragment.push('<p>', elem.description[index || 0], '</p>');
         }
       }

      $("#data_glossary").html(documentFragment.join(''));
      glossary.glossary();
      createContextualCSS(click.target);
      $(window).unbind("resize")
               .bind("resize", function ()
                                {
                                 createContextualCSS(click.target);
                                });
     }
     
    closeModal();
   }
  
  
  // Public Interface
  // ----------------
  this.getData = getData;

  
  // One-time setup
  // --------------
  init();
}