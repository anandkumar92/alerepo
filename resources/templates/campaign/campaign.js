function Campaign(args)
 {
  var _config = {};
  setConfig(args);
  function getConfig()
  {
   return _config;
  }
  function setConfig(args)
  {
   _config = $.extend({
                       link : this
                      }, args);
  }
  
  var toolkitTestData;
  function getData()
  {
   var data;
   
   if ($('#lightbox_toolkit_lb').length > 0)
    {
     data = {
             questions : toolkitTestData
            };
    }
   else
    {
     data = app.template.getData();
    }

   return data;
  }
  
  
  var app = getConfig().link,
      console = new Console();
  
  console.info('@campaign.js');
  
  init();
  function init()
  {
   if ($('#lightbox_toolkit_lb').length > 0)
    {
     return;
    }
   
   console.info('@campaign.init()');

//   app.hooks.clearHooks();
//   app.hooks.setHook({
//                       'name' : 'RenderTest',
//                       'functionName' : function ()
//                                         {
//                                          app.thisTemplate.render();
//                                         }
//                      });
   render();
  }
  
  this.render = render;
  
  function render(){
   buildHTML();
   bindEvents();
  }
  
  function buildHTML(){
   var imageArray = getData().content[0].options;
   var img;
   var htmlContent = [];
   htmlContent.push('<div class="selectScreen">');
   for(img in imageArray){
    if(imageArray.hasOwnProperty(img)){
     htmlContent.push('<div class="imgContainer cursorPointer" id="option_'+ img +'"><img class="option" src="/s3scorm/ale/content/assets/' + imageArray[img].image + '" />'+ imageArray[img].name +'</div>');
    }
   }
   htmlContent.push('</div><div class="textScreen"></div>');
   $('#data_content_container').prepend(htmlContent.join(''));
   $('.textScreen').hide();
   $('#button_content').append('<button id="select" class="buttonInactive" disabled>SELECT</button>');
  }
  
  
  function bindEvents(){
   $('.imgContainer', '.selectScreen').unbind('click').bind('click',function(){
    var img = $(this).find('img');
    if(img.hasClass('optionSelect')){
     img.removeClass('optionSelect').addClass('option');
    }
    else{
     if($('.optionSelect').length < 3){
      img.removeClass('option').addClass('optionSelect');
     }
    }
    if($('.optionSelect').length == 3){
     $('.buttonInactive').removeClass('buttonInactive').addClass('buttonActive').attr('disabled',false);
     $('.option').parent().removeClass('cursorPointer').addClass('cursorDefault');
    }
    else{
     $('.buttonActive').removeClass('buttonActive').addClass('buttonInactive').attr('disabled',true);
     $('.imgContainer').removeClass('cursorDefault').addClass('cursorPointer');
    }
   });
   
   $('#select').unbind('click').bind('click',function(){
    $('.selectScreen').hide();
    var parent;
    var htmlContent = [];
    var imgSrc;
    var title;
    $('.optionSelect').each(function(index){
     parent = $(this).parent();
     imgSrc = $(this).attr('src');
     title = parent.text();
     htmlContent.push('<div class="textContainer"><div class="imgContainer" id="option_' + index + '"><div class="imgBorder"><img src="'+ imgSrc +'" /></div>'+ title +'</div><textarea id="text_'+ index +'"></textarea></div>');
    });
    $('.textScreen').append(htmlContent.join(''));
    $('#button_content').empty().append('<button id="submit" class="buttonInactive">SUBMIT</button>');
    $('.textScreen').show();
    bindTextEvents();
   });
  }
  
  function bindTextEvents(){

   $('textarea').unbind('keyup').bind('keyup',function(){
    var notEmpty = 0;
    $('textarea').each(function(){
     if($.trim($(this).val()) === ''){
      notEmpty = 1;
     }
    });
    if(notEmpty === 1){
     $('#submit').removeClass('buttonActive').addClass('buttonInactive').attr('disabled',true);
    }
    else{
     $('#submit').removeClass('buttonInactive').addClass('buttonActive').attr('disabled',false);
    }
   });
   
   $('#submit').unbind('click').bind('click',function(){
    var questions = app.getTest().getQuestionBank();
    console.info('@freeWrite.submitAnswers()');
    
    $('textarea').each(function(index){
     questions[index].learner_response = $(this).val();
     questions[index].htmlContent = $(this).prev().html();
    });
    
    
    app.getTest().recordTest({
     'score' : 0 // indicates completion - instructor will manually grade later 
    });
    app.getTest().recordAttemptResult({
     testId: app.getPageName(),
     attempt: 1,
     score: undefined,
     persist: true
   });
    app.doNext();
    
   });
  }
  
  App.prototype.toolkitInit = function(args)
  {
   
   toolkitTestData = args.testData;
   var question;
   var content = [];
   for(question in toolkitTestData){
    if(toolkitTestData.hasOwnProperty(question)){
     content.push('<div class="campaignContainer">');
     content.push('<div class="imgContainer">' + toolkitTestData[question].htmlContent + '</div><div class="campaignAnswer">'+ toolkitTestData[question].learner_response +'</div>');
     content.push('</div>');
    }
   }
   $('#lightbox_toolkit_lb #lightbox_data_content_container').html(content.join(''));
   
   if($.browser.msie)
    {
     Nifty('div.choice', 'big');  
     setTimeout(function()
                 {
                  $('#lightbox_data_questionTitle h4').css('height', '30px');
                  if($('div#lightbox_data_question').html())
                   {
                    Nifty('div#lightbox_data_question', 'big');
                   }
                  else
                   {
                    $('div#lightbox_data_question').css('display', 'none');
                   }
                  if($('div#lightbox_data_questionTitle').html())
                   {
                    Nifty('div#lightbox_data_questionTitle', 'big');     
                   }
                  else
                   {
                    $('div#lightbox_data_questionTitle').css('display', 'none');
                   }
                 }, 25);
    }
  };
 }

App.prototype.thisTemplate = new Campaign({
                            			"link" : ale
										});