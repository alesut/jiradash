(function(){
  /*
  * Main program
  */
  // constants
  var url_icon_loading = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var subtask_query = '/monitor/jira/api/2/issue/{key}?fields=timespent';

  // this class helps extract the value
  function ISSUE(issue){
    this.get = function(path){
      var elements = path.split('.');
      var pointer  = issue;

      for(var i in elements){
        pointer = pointer[elements[i]];
        if(!pointer){
          return;
        }
      }     

      return pointer;
    };
  }

  надо переписать на каждый тип отображения свой engine со своими данными из jira


  function ENGINE(TYPE, BLOCKS, MAIN_CONTAINER, OPTIONS){
    var self = this;
    var initialized;
    var storage = new window.TaskStorage();
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();
window.storage = storage;
    var TASK_REWRITE_RULES = OPTIONS.TASK_REWRITE_RULES || [];

    var processResults= function(data){
      for(var idx = 0; idx < data.issues.length; idx++){
        var issue = new ISSUE(data.issues[idx]);

        var displayName = issue.get('fields.assignee.displayName');
        var email       = issue.get('fields.assignee.emailAddress');
        var login       = issue.get('fields.assignee.name');
        var avatar      = issue.get('fields.assignee.avatarUrls.48x48');

        storage.addPerson(login, displayName, avatar);

        var task = {
          login         : login,
          status        : issue.get('fields.status.name'),
          priorityIcon  : issue.get('fields.priority.iconUrl'),
          priority      : utils.PRIORITY_RANK(issue.get('fields.priority.name')),
          rank          : issue.get('fields.customfield_10300'),
          key           : issue.get('key'),
          subtasks      : issue.get('fields.subtasks.length'),
          summary       : issue.get('fields.summary'),
          description   : issue.get('fields.description'),
          project       : issue.get('fields.project.key'),
          timespent     : utils.timespentToHours(issue.get('fields.timespent')),
          updated       : new Date(issue.get('fields.updated')),
          worklogs      : issue.get('fields.worklog.worklogs')
        };

        utils.rewrite_task(TASK_REWRITE_RULES, task);

        // if(task.worklogs && task.worklogs.length){
        //   task.timespent = 0;
        //   for(var i in task.worklogs){
        //     var wl = task.worklogs[i];
        //     task.timespent += wl.timeSpentSeconds/3600;
        //   }
        // }
        // laod all the data associated with task
        var subtasks = issue.get('fields.subtasks');
        if(subtasks && subtasks.length){
          // load task data
          var urls = [utils.prepareURL(subtask_query, task)];
          // prepare url for subtasks loading
          for(var k = 0; k < subtasks.length; k++){
            var subtask = subtasks[k];
            urls.push(utils.prepareURL(subtask_query, subtask));
          }
          // clear subtask time spend util it loaded complete
          task.timespent = '*';

          // add tasks for sequental loading
          network.load(task, urls, function(err, context, results){
            var timespent = 0;
            for(var idx in results){
              var subtask = results[idx];
              timespent += utils.timespentToHours(subtask.fields.timespent);
            }
            // update calculated timespent
            context.timespent = timespent;
            // if context hidden by limit, it doesnt have update function;
            if(context.update){
              context.update();
            }
          });
        }

        storage.addPersonTask(task.login, task);
      };
    };

    var drawLineTextFromTask = function(block, task, paper, y, update_elms){
      //  mark tasks with subtasks
      var css_name = task.status.replace(/ /g, '_').toLowerCase();
      if(task.subtasks){
        css_name += ' subtasks';
      }

      var timespent      = task.timespent === '*' ? '' : task.timespent;
      var task_url       = utils.prepareURL(block['task_links'], task);
      var task_url_title = (task.summary || '') + (task.description || '');

      // when update data is done and update() is called
      if(update_elms){
        // update timespent
        update_elms[0].changeText(utils.timespentFormater(timespent));
        // update prioirty icon
        update_elms[1].changeImage(task.priorityIcon);
        return;
      }

      // save elements to have pointer to them on update ^^
      var elements = [];
      var text_element;

      // timespent
      text_element = paper.text(25, y-1, utils.timespentFormater(timespent), task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-hours');
      elements.push(text_element);

      // priority icon or loading symbol...
      if(task.timespent === '*'){
        elements.push(paper.img(27, y-14, 16, 16, url_icon_loading));
      }else{
        elements.push(paper.img(27, y-14, 16, 16, task.priorityIcon));
      }

      // task key
      text_element = paper.text(46, y, task.key, task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-task-number');
      text_element.setAttributeNS("http://www.w3.org/XML/1998/namespace", 'textLength', '3');
      elements.push(text_element);

      // task summary
      text_element = paper.text(134, y, task.summary, task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-summary');
      elements.push(text_element);

      return elements;
    };

    var drawBlocksTable = function(){
      // MAIN CODE:
      for(var idx in BLOCKS){
        var title = '';
        var block = BLOCKS[idx];

        if(block.skip){
          layout.nextWindow();
          continue;
        }

        if(block.title !== undefined){
          title = block.title;
        }
        else if(block.login){
          var person = storage.getPersons(block.login);
          title = person && person.displayName || block.login;
        }

        var filter_options = {};
        /* block is a filter itslef */
        for (var key in block) {
          filter_options[key] = block[key];
        };
        // add some functions
        filter_options.task_sorter = utils['task_sorter_' + block.sort_by] || utils.task_sorter_default;

        var block_data = {
          title : title,
          tasks : storage.getTasks(filter_options)
        };

        // create box
        var container = document.createElement("div");
        container.setAttribute('class', 'man');
        container.style.width = layout.getBlockWidth() + 'px';
        MAIN_CONTAINER.appendChild(container);

        // init SVG
        paper = new drawlib.paper(container);
        paper.setStyle('width', container.style.width);
        // generate from template and block data
        if(title){
          var title_url = utils.prepareURL(block['title_link'], block);
          // add names
          paper.text(0, layout.getLine(1), block_data.title, title_url).setAttribute('class', 'man_name');
        }else{
          // or separator line
          var y =  layout.getLine(0);
          var line = paper.line(46, y, layout.getBlockWidth() - 10, y);
          line.setAttribute('class', 'subtask-separator');
        }

        var tasks_to_display = 2;
        // add tasks
        for(var i in block_data.tasks){
          var task = block_data.tasks[i];

          var y = layout.getLine();
          var elms = drawLineTextFromTask(block, task, paper, y);

          // define update function (used when subtasks data updated)
          task.update = (function(t, b, e){
            return function(){
              drawLineTextFromTask(b, t, null, null, e);
            };
          })(task, block, elms);

          // draw not all tasks but as block limit require
          var left = block_data.tasks.length - 1 - i;
          if(left){
            tasks_to_display++;
          }

          if(i > block.limit - 1){
            if(left){
              paper.text(0, y + 18, left + ' more ...', title_url);
            }
            break;
          }
        }

        // adjust block deminition
        var height = tasks_to_display * layout.getLineHeight();
        paper.setAttribute('height', height);

        container.style.left   = layout.getBlockLeft() + 'px';
        container.style.top    = layout.getBlockHeight() + 'px';
        container.style.height = height + 'px';

        layout.addBlockHeight(height);
        layout.nextWindow();
      }
    };

    this.clearScreen = function(){
      // CLEAR SCREEN
      var node = MAIN_CONTAINER;
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
      layout.reset();
    };

    this.drawMsg = function(text){
      var container = document.createElement("div");
      container.setAttribute('class', 'message');
      MAIN_CONTAINER.appendChild(container);
      container.innerHTML = text;
    };

    this.process = function(query, callback){
      if(!initialized){
        self.drawMsg('loading...');
      }

      network.load([query], function(err, data){
        self.clearScreen();
        initialized = true;

        if(err){
          self.drawMsg([err.status, err.statusText].join(' '));
          callback(err);
        }
        else if(data){
          storage.clear();

          processResults(data[0]);
          drawBlocksTable();
          callback(null, data);
        }
      });
    };
  }

  window.TaskEngine = ENGINE;
})();


