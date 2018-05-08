$(function ()
   {
    var template = "vidNotesRemediation_test";
    
    /**
     * Prevents the script from getting loaded twice
     */
    function addTest()
     {
      App.prototype.unitTests[template] = (function (link)
                                           {
                                            var app = link;
                                            
                                            return {
                                                    init : function ()
                                                            {
                                                             test("template structure", function()
                                                              {
                                                               ok(false, "saveAndContinue buttons are disabled");
                                                               ok(false, "data elements got bound correctly");
                                                               ok(false, "image assets aren't broken");
                                                              });
                                                              
                                                             test("question content", function()
                                                              {
                                                               ok(false, "image assets aren't broken");
                                                               
                                                               $('#menu_button').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'block', "menu showing");
                                                               
                                                               $('#nav_menu_close').trigger('click');
                                                               ok($('#page_array_container').css('display') === 'none', "menu hiding");
                                                              });
                                                              
                                                             test("test interaction", function()
                                                              {
                                                               var excerpts = app.template.getData().content[0].excerptData,
                                                                   
                                                                   // Used in the loop iterator below
                                                                   excerptsLength = excerpts.length,
                                                                   
                                                                   // Initializing the loop iterator below
                                                                   i = 0,
                                                                   
                                                                   // Initializing questions used in the loop below 
                                                                   questions;
                                                               
                                                               // Loop through each excrept
                                                               for (; i < excerptsLength; i++)
                                                                {
                                                                 // Assert that the proper excerpt is visible
                                                                 ok($('div.excerpt:eq(' + i + ')').css('display') === 'block', 'excerpt ' + i + ' is visible');
                                                                 
                                                                 // Assert all img assets are not broken
                                                                 var imagePlaceholder = document.createDocumentFragment(),
                                                                     tempImage = document.createElement('img');
                                                                 
                                                                 
                                                                 $(tempImage).bind('error', function ()
                                                                                             {
                                                                                              alert('broken image');
                                                                                             });
                                                                 
                                                                 /* // Need a better solution for checking broken images
                                                                 ok($(tempImage).bind('error', function ()
                                                                                                {
                                                                                                 return false;
                                                                                                }), 'broken image URL');*/
                                                                                               
                                                                 tempImage.src = $('img', 'div.excerpt:eq(' + i + ')').attr('src');
                                                                 
                                                                 imagePlaceholder.appendChild(tempImage);
                                                                 //$('div.excerpt:eq(' + i + ')').append(imagePlaceholder);
                                                                 
                                                                 
                                                                 $('img', 'div.excerpt:eq(' + i + ')').each(function()
                                                                                                             {
                                                                                                              $(this).css({border: '1px solid #f00 !important'});
                                                                                                              ok($(this).height() > 0, 'image height is > 0');
                                                                                                             });
                                                                 
                                                                 // Click all the questions
                                                                 questions = $('span.answerArea', 'div.excerpt:eq(' + i + ')');
                                                                 
                                                                 $(questions).each(function()
                                                                                    {
                                                                                     var that = this;
                                                                                     
                                                                                     // Click the question item
                                                                                     $(this).trigger('click');
                                                                                     
                                                                                     // Assert a lightbox is displayed
                                                                                     ok($('div.lightbox:visible').length > 0, 'a lightbox was displayed');
                                                                                     
                                                                                     // Click the first answer item
                                                                                     $('div.answer', 'div.lightbox:visible').each(function ()
                                                                                                                                   {
                                                                                                                                    $('input', this).trigger('click');
                                                                                                                                    
                                                                                                                                    // Assert the answer was populated in the correct answer area
                                                                                                                                    ok($(that).html() === $('label', this).html(), 'value was populated properly');
                                                                                                                                    
                                                                                                                                    // Assert that the "saveAndContinue" buttons are properly visible
                                                                                                                                   });
                                                                                     
                                                                                     // Close the question item by clicking the "x" button
                                                                                     $('a.close', 'div.lightbox:visible').trigger('click');
                                                                                     
                                                                                     // Assert no lightboxes are displayed
                                                                                     ok($('div.lightbox:visible').length === 0, 'lightbox was hidden');
                                                                                    });
                                                                 
                                                                 // Open the next excerpt
                                                                 $('h1', 'div.excerpt:eq(' + (i + 1) + ')').trigger('click');
                                                                }
                                                              });
                                                            }
                                                   };
                                           })(ale);
     }
    
    if (App.prototype.unitTests)
     {
      if (App.prototype.unitTests[template])
       {
        App.prototype.unitTests[template].init();
       }
      else
       {
        addTest();
        App.prototype.unitTests[template].init();
       }
     }
    else
     {
      App.prototype.unitTests = {};
      addTest();
      App.prototype.unitTests[template].init();
     }
   })();