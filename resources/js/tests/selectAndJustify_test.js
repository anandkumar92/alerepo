$(function ()
   {
    var template = 'selectAndJustify_test';
    
    function addTest()
     {
      App.prototype.unitTests[template] = (function (link)
                                           {
                                            var app = link,
                                                data = app.template.getData(),
                                                questionType = data.questionConfig.type;
                                            
                                            return {
                                                    init : function ()
                                                            {
                                                             test('template load', function()
                                                                                    {
                                                                                     ok(true, 'template loaded.');   
                                                                                    });
                                                             test('JSON content validation', function()
                                                                                              {
                                                                                               var flag = true,
                                                                                                   temp;
                                                                                               switch(questionType)
                                                                                                {
                                                                                                 case 'accordion':
                                                                                                 case 'accordionRef':
                                                                                                  break;
                                                                                                 case 'listRef':
                                                                                                  if(temp = data.content[0])
                                                                                                   {
                                                                                                    if(!temp.image)
                                                                                                     {
                                                                                                      ok(false, 'image property is required for binding image reference source');  
                                                                                                     }
                                                                                                    else if(!temp.image.content)
                                                                                                     {
                                                                                                      ok(false, 'content property of image object is required.');
                                                                                                     }
                                                                                                   }
                                                                                                  else
                                                                                                   {
                                                                                                    ok(false, 'content is is required for binding reference information');
                                                                                                   }
                                                                                                  break;
                                                                                                 default:
                                                                                                  flag = false;
                                                                                                }
                                                                                               ok(flag, (flag ? 'supported' : 'unsupported') + ' question type: ' + questionType);
                                                                                               if(flag)
                                                                                                {
                                                                                                 ok(data.questions.length, 'required questions list');  
                                                                                                }
                                                                                              });
                                                             test('user interaction', function()
                                                                                       {
                                                                                        var testSubmit = true;
                                                                                        switch(questionType)
                                                                                         {
                                                                                          case 'accordion':
                                                                                          case 'accordionRef':
                                                                                           break;
                                                                                          case 'listRef':
                                                                                           $('#question_content a').each(function(index, elem)
                                                                                                                          {
                                                                                                                           $(this).trigger('click');
                                                                                                                           $('#lightbox_0' + index + ' input:radio').eq(Math.floor(Math.random()*11) % 2).trigger('click');
                                                                                                                           $('#lightbox_0' + index + ' a').trigger('click');
                                                                                                                          });
                                                                                           ok(!$('#submit_link').hasClass('disabled'), 'submit button should be enabled after answering all questions.');
                                                                                           break;
                                                                                          default:  
                                                                                           testSubmit = false;
                                                                                         }
                                                                                        if(testSubmit)
                                                                                         {
                                                                                          $('#submit_link').trigger('click');
                                                                                          ok(!$('#submit_link').length, 'remove submit button');
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