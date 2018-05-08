function Notepad(app)
 {
  var notesBank,
      template,
      _dirty = true,
      noteInfo;
  
  function setNoteInfo(info)
   {
    noteInfo = info;
   }
  
  function getNoteInfo()
   {
    return noteInfo;
   }
  
  function isBankDirty()
   {
    return _dirty;  
   }
  
  function setBankDirty(value)
   {
    _dirty = value;    
   }
  
  function activateNote(pageIndex) {
   if(notesBank && (typeof pageIndex !== 'undefined'))
    {
     var page = app.getPagesObject().pages[pageIndex],
         note;
     if(page && (note = page.note))
      {
       notesBank[note.group].active = true;
       $.each(notesBank[note.group].items, function()
                                            {
                                             if(this.testId === page.name)
                                              {
                                               this.active = true;
                                               return false;
                                              }
                                            });
      }
    }
  }
  
  function getTemplate() 
   {
    return template;
   }
  
  function setTemplate(tpl)
   {
    template = tpl;  
   }
  
  function buildNotesBank(testId)
   {
    if(isBankDirty())
     {
      setBankDirty(false);
      notesBank = {};
      var questionBank = app.questionBank,
          questionList,
          note,
          pageInfo;

      $.each(app.getPagesObject().pages, function(index, item)
                                          {
                                           if(note = this.note)
                                            {
                                             pageInfo = {
                                                         testId: this.name,
                                                         name: note.name
                                                        };
                                             if(!notesBank[note.group])
                                              {
                                               notesBank[note.group] = {items: [], active: false};
                                              }
                                             if(questionBank[this.name])
                                              {
                                               pageInfo.active = true; 
                                               notesBank[note.group].active = true;
                                               if(questionBank[this.name].length)
                                                {
                                                 pageInfo.note = questionBank[this.name][questionBank[this.name].length - 1].note;    
                                                }
                                               else
                                                {
                                                 pageInfo.note = '';
                                                }
                                              }
                                             else 
                                              {
                                               pageInfo.active = false;
                                              }
                                             notesBank[note.group].items.push(pageInfo);
                                            }
                                          });
     }
   }
  
  function loadCss()
   {
      // Load template CSS
    if (!$('#notepadCss').length) {
        var css,
            preventCache = '?n=' + new Date().getTime();
        css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = app.baseURL + 'resources/js/lib/notepad/css/notepad.css' + preventCache;
        css.type = 'text/css';
        css.id = 'notepadCss';
        document.getElementsByTagName('head')[0].appendChild(css);
       }
   }
  
  function buildNoteList()
   {
    var item,
        html = [],
        buildList = function(index, name, items, htmlArray)
                     {
                      htmlArray.push('<div id="group_', index, '" class="groupBox"><div class="groupName">', name, '</div><div class="noteList">');
                      $.each(items, function(index, i)
                                     {
                                      htmlArray.push('<div class="noteItem">', i.name, '</div>');
                                     });
                      htmlArray.push('</div></div>');
                     },
        index = 0;
    for(item in notesBank)
     {
      buildList(index++, item, notesBank[item].items, html);
     }
    $('#list_container').append(html.join(''));
   }
  
  function buildBaseLine() 
   {
    var h = $('#notepad_container .rightBox').height() - 40,
        index = 1, 
        html = [], 
        buildBaseline = function(top, arr)
                        {
                         arr.push('<div class="line" style="top:', top, 'px">&nbsp;</div>');
                        };
    while((h = h - 20) >= 20)
     {
      buildBaseline(index++ * 20, html);
     }
    $('#note_container').append(html.join(''));
   }
  
  function build()
   {
    buildNoteList();
   }
  
  function populateList(thisTestId)
   {
    var boxes = $('#list_container .groupBox'),
        box,
        groupindex = 0;
    $.each(notesBank, function(key, value)
                       {
                        boxes.eq(groupindex++).toggleClass('active', value.active)
                                         .find('.noteItem')
                                         .each(function(index, item) 
                                                {
                                                 if(value.items[index].testId === thisTestId)
                                                  {
                                                   value.items[index].active = true;
                                                  }
                                                 $(this).toggleClass('active', value.items[index].active)
                                                        .toggleClass('hasNote', value.items[index].note ? true : false);
                                                });
                        
                       });
   }
  
  function noteClicked(args)
   {
    var groupName = $(args.groupBox).find('.groupName').html(),
        noteContainer = $('#note_container'),
        item = notesBank[groupName].items[args.noteIndex];
    
    setNoteInfo({
        groupIndex: args.groupIndex,
        noteIndex: args.noteIndex,
        groupName: groupName,
        testId: item.testId
    });
    
    noteContainer.find('#note_title').html(groupName + ':&nbsp;' + item.name).removeClass();
    if(args.hasNote)
     {
      $('#note_adder').hide();
      noteContainer.removeClass().addClass('viewing');
      $('#note_content').html(item.note);
     }
    else
     {
      noteContainer.removeClass().addClass('adding')
      if($('#note_adder').length)
       {
        $('#note_adder').attr('value', '').show();
       }
      else
       {
        noteContainer.append('<textarea id="note_adder"></textarea>');
       }
     }
   }
  
  function unbindEvent()
   {
    $('#list_container .groupBox').unbind('click');
    $('#note_container').unbind('click');
   }
  
  function editNote()
   {
    $('#note_adder').remove();
    $('#note_container').removeClass()
                        .addClass('editing')
                        .append('<textarea id="note_adder">' + $('#note_content').html() + '</textarea>');
    
   }
  
  function updateCurrentNote(value)
   {
    var info = getNoteInfo();
    if(typeof value === 'undefined')
     {
      delete notesBank[info.groupName].items[info.noteIndex].note;
      notesBank[info.groupName].items[info.noteIndex].hasNote = false;
      $('#list_container .groupBox:eq(' + info.groupIndex + ') .noteItem:eq(' + info.noteIndex + ')').removeClass('hasNote');
     }
    else
     {
      notesBank[info.groupName].items[info.noteIndex].note = value;  
      notesBank[info.groupName].items[info.noteIndex].hasNote = true;
      $('#list_container .groupBox:eq(' + info.groupIndex + ') .noteItem:eq(' + info.noteIndex + ')').addClass('hasNote');
     }
   }
  
  function saveNote()
   {
    var questions = app.questionBank[getNoteInfo().testId],
        content = $('#note_adder').attr('value');
    
    if ($('#note_adder').length === 0 || content.length === 0)
     {
      // Don't save an empty value.
      return;
     }
    
    if(questions.length)
     {
      questions[questions.length - 1].note = content;     
     }
    else
     {
      questions.push({
       note: content 
      }); 
     }
   
    app.getTest().recordInteraction({
                                     id:0,
                                     testID: getNoteInfo().testId
                                     });
    $('#note_adder').remove();
    $('#note_content').html(content);
    $('#note_message').show().fadeOut(3 * 1000);
    $('#note_container').removeClass().addClass('viewing');
    
    updateCurrentNote(content);
   }
  
  function bindEvent()
   {
    $('#list_container .groupBox').bind('click', function(args)
                                                     {
                                                      var groupIndex = $('#list_container .groupBox').index(this),
                                                          target = $(args.target),
                                                          noteIndex;
                                                      if(target.hasClass('groupName'))
                                                       {
                                                        $(this).toggleClass('open');   
                                                       }
                                                      else if(target.hasClass('noteItem') && target.hasClass('active') && !target.hasClass('highlighted'))
                                                       {
                                                        // triggering a click in case user has written a note and its not saved yet
                                                        $('div#save_button').trigger('click');
                                                        
                                                        noteIndex = $('.noteItem', this).index(target);
                                                        $('#list_container .noteItem.highlighted').removeClass('highlighted');
                                                        target.addClass('highlighted');
                                                        noteClicked({
                                                         groupBox: this,
                                                         groupIndex: groupIndex,
                                                         noteIndex: noteIndex,
                                                         hasNote: target.hasClass('hasNote')
                                                        });
                                                        
                                                       }
                                                     });
    $('#note_container').bind('click', function(args)
                                        {
                                         var target = args.target;
                                         switch(target.id)
                                          {
                                           case 'edit_link':
                                               editNote();
                                               break;
                                           case 'save_button':
                                               saveNote();
                                               break;
                                           default:
                                                   
                                          }
                                        });
   }

  function onShow(testId)
   {
    var highlightedIndex;
    
    buildBaseLine();
    if(testId)
     {
      var groupIndex = 0;
      $.each(notesBank, function(key, value)
                         {
                          $.each(value.items, function(index)
                                               {
                                                if(this.testId === testId)
                                                 {
                                                  var groupBox = $('#list_container .groupBox').eq(groupIndex).addClass('open');
                                                  noteClicked({
                                                   groupBox: groupBox,
                                                   groupIndex: groupIndex,
                                                   noteIndex: index,
                                                   hasNote: groupBox.find('.noteItem:eq(' + index + ')').addClass('highlighted').hasClass('hasNote')
                                                  });
                                                  return false;
                                                 }
                                               });
                          groupIndex++;
                         });
      
      // Ensure previous noteItems are active
      highlightedIndex = $('div.noteItem').index($('div.noteItem.highlighted'));
      
      while (highlightedIndex >= 0)
       {
        $('div.noteItem:eq(' + highlightedIndex + ')').addClass('active');
        
        $('div.groupName:eq(' + $('div.noteItem:eq(' + highlightedIndex + ')').parent().parent().index() + ')').parent().addClass('active');
        
        highlightedIndex -= 1;
       }
      
      $('#lightbox_container').centerWithNavigation();
     }
   }
  
  function show(testId)
   {
    if(!testId)
     {
      testId = app.getPagesObject().pages[app.getCurrentPage()].name;
     }
    buildNotesBank();
    loadCss();
    var tpl = getTemplate();
    app.lightbox.showBox({
     title: '<span class="notepadTitle">notepad</span>',
     header: 'Create new notes, or review notes taken previously',
     content: tpl || '<div id="notepad_container"><div id="container_wrapper" style="display:none;"><div class="leftBox aleInline"><h3>saved notes</h3><div id="list_container"></div></div><div class="rightBox aleInline">' + 
                     '<div id="note_container"><h3 id="note_title"></h3><div id="note_message" style="display:none;">Note saved</div><div id="note_content"></div><div class="actions"><span id="edit_link" class="edit_link">edit this note</span><div id="save_button" class="save_button">&nbsp;</div></div></div></div></div></div>',
     modal: true,
     onClose: unbindEvent,
     contentWidth: 910,
     wrapperClass: 'notepad_box'
    });
    if(!tpl)
     {
      build();
     }
    else
     {
      $('#container_wrapper').removeAttr('style');
     }
    populateList(testId);
    bindEvent();
    $('#container_wrapper').show(250, function()
                                       {
                                        onShow(testId);
                                       });
    if(!tpl)
     {
      setTemplate(['<div id="notepad_container">', $('#notepad_container').html(), '</div>'].join(''));
     }
   }
  
  this.show = show;
  this.activateNote = activateNote;
 }